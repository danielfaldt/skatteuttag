from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
import re
from typing import Any
import unicodedata

from pypdf import PdfReader


AMOUNT_PATTERN = re.compile(r"\(?-?\d[\d.,]*\)?")


@dataclass(frozen=True)
class FieldMatch:
    field: str
    value: float
    source_label: str
    page: int
    line: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "value": round(self.value, 2),
            "source_label": self.source_label,
            "page": self.page,
            "line": self.line,
        }


def normalize_text(value: str) -> str:
    return " ".join(value.replace("\u00a0", " ").split()).strip().lower()


def parse_amount(token: str) -> float:
    normalized = token.strip().replace("\u00a0", " ")
    negative = normalized.startswith("(") or normalized.startswith("-")
    normalized = normalized.strip("()").lstrip("-").replace(" ", "")

    if "," in normalized:
        normalized = normalized.replace(".", "").replace(",", ".")
    else:
        normalized = normalized.replace(".", "")

    value = float(normalized)
    return -value if negative else value


def extract_amounts(text: str) -> list[float]:
    tokens = [match.group(0) for match in AMOUNT_PATTERN.finditer(text.replace("\u00a0", " "))]
    if not tokens:
        return []

    digit_groups = [token.lstrip("-").strip("()") for token in tokens]
    if all(re.fullmatch(r"\d{1,3}", token) for token in digit_groups) and len(digit_groups) > 1:
        if len(digit_groups) == 2:
            groups_for_first_amount = 2
        elif len(digit_groups) == 3:
            groups_for_first_amount = 3
        elif len(digit_groups) == 4:
            groups_for_first_amount = 2
        else:
            groups_for_first_amount = 3

        return [parse_amount(" ".join(tokens[:groups_for_first_amount]))]

    return [parse_amount(token) for token in tokens]


def extract_pdf_pages(pdf_bytes: bytes) -> list[str]:
    reader = PdfReader(BytesIO(pdf_bytes))
    return [page.extract_text() or "" for page in reader.pages]


def find_label_matches(pages: list[str], labels: list[tuple[str, str]]) -> list[FieldMatch]:
    matches: list[FieldMatch] = []

    for page_number, page_text in enumerate(pages, start=1):
        lines = [line.strip() for line in page_text.splitlines()]
        normalized_lines = [normalize_text(line) for line in lines]

        for idx, normalized_line in enumerate(normalized_lines):
            if not normalized_line:
                continue

            for label, source_label in labels:
                if label not in normalized_line:
                    continue

                context_lines = [line for line in lines[idx: idx + 3] if line.strip()]
                amounts = extract_amounts(lines[idx])
                if not amounts and len(context_lines) > 1:
                    amounts = extract_amounts(" ".join(context_lines[1:]))
                if not amounts:
                    continue

                matches.append(
                    FieldMatch(
                        field="",
                        value=amounts[0],
                        source_label=source_label,
                        page=page_number,
                        line=context_lines[0],
                    )
                )

    return matches


def find_label_match(pages: list[str], labels: list[tuple[str, str]]) -> FieldMatch | None:
    matches = find_label_matches(pages, labels)
    return matches[0] if matches else None


def parse_annual_report_pages(pages: list[str]) -> dict[str, FieldMatch]:
    matches: dict[str, FieldMatch] = {}

    company_profit_match = find_label_match(
        pages,
        [
            ("resultat efter finansiella poster", "Resultat efter finansiella poster"),
            ("resultat före skatt", "Resultat före skatt"),
        ],
    )
    if company_profit_match and company_profit_match.value >= 0:
        matches["company_result_before_corporate_tax"] = FieldMatch(
            field="company_result_before_corporate_tax",
            value=company_profit_match.value,
            source_label=company_profit_match.source_label,
            page=company_profit_match.page,
            line=company_profit_match.line,
        )

    retained_total_match = find_label_match(
        pages,
        [
            ("summa fritt eget kapital", "Summa fritt eget kapital"),
            ("fritt eget kapital", "Fritt eget kapital"),
        ],
    )
    balanced_result_match = find_label_match(
        pages,
        [
            ("balanserat resultat", "Balanserat resultat"),
            ("balanserad vinst", "Balanserad vinst"),
        ],
    )

    retained_value: float | None = None
    retained_source_label: str | None = None
    retained_page: int | None = None
    retained_line: str | None = None

    if balanced_result_match:
        retained_value = balanced_result_match.value
        retained_source_label = balanced_result_match.source_label
        retained_page = balanced_result_match.page
        retained_line = balanced_result_match.line
    elif retained_total_match:
        retained_value = retained_total_match.value
        retained_source_label = retained_total_match.source_label
        retained_page = retained_total_match.page
        retained_line = retained_total_match.line

    if retained_value is not None and retained_value >= 0 and retained_source_label and retained_page and retained_line:
        matches["opening_retained_earnings"] = FieldMatch(
            field="opening_retained_earnings",
            value=retained_value,
            source_label=retained_source_label,
            page=retained_page,
            line=retained_line,
        )

    periodization_matches = find_label_matches(
        pages,
        [
            ("summa obeskattade reserver", "Summa obeskattade reserver"),
            ("periodiseringsfonder", "Periodiseringsfonder"),
            ("periodiseringsfond", "Periodiseringsfond"),
            ("obeskattade reserver", "Obeskattade reserver"),
        ],
    )
    periodization_match = max(
        (match for match in periodization_matches if match.value >= 0),
        key=lambda match: match.value,
        default=None,
    )
    if periodization_match and periodization_match.value >= 0:
        matches["opening_periodization_fund_balance"] = FieldMatch(
            field="opening_periodization_fund_balance",
            value=periodization_match.value,
            source_label=periodization_match.source_label,
            page=periodization_match.page,
            line=periodization_match.line,
        )

    return matches


def infer_report_metadata(*, filename: str | None = None, pages: list[str]) -> dict[str, Any]:
    metadata: dict[str, Any] = {"company_name": None, "report_year": None}

    if filename:
        normalized_filename = unicodedata.normalize("NFC", filename)
        company_match = re.search(r"[åa]rsredovisning\s*-\s*(.*?)\s*-\s*r[äa]kenskaps[åa]ret", normalized_filename, re.IGNORECASE)
        if company_match:
            metadata["company_name"] = company_match.group(1).strip()

        year_match = re.search(r"(19|20)\d{2}", normalized_filename)
        if year_match:
            metadata["report_year"] = int(year_match.group(0))

    if metadata["report_year"] is None:
        for page_text in pages[:2]:
            year_match = re.search(r"r[äa]kenskaps[åa]r(?:et)?\s+(19|20)\d{2}", page_text, re.IGNORECASE)
            if year_match:
                metadata["report_year"] = int(year_match.group(0)[-4:])
                break

    return metadata


def import_annual_report(pdf_bytes: bytes, *, filename: str | None = None) -> dict[str, Any]:
    pages = extract_pdf_pages(pdf_bytes)
    matches = parse_annual_report_pages(pages)
    if not matches:
        raise ValueError("Kunde inte läsa några säkra värden ur årsredovisningen.")

    metadata = infer_report_metadata(filename=filename, pages=pages)
    warnings: list[str] = []

    if "company_result_before_corporate_tax" not in matches:
        warnings.append("Hittade inget säkert värde för bolagets resultat före bolagsskatt.")
    if "opening_retained_earnings" not in matches:
        warnings.append("Hittade inga säkra fria vinstmedel att fylla i.")
    if "opening_periodization_fund_balance" not in matches:
        warnings.append("Hittade inget säkert ingående saldo i periodiseringsfond.")

    return {
        "filename": filename or "annual-report.pdf",
        "company_name": metadata["company_name"],
        "report_year": metadata["report_year"],
        "fields": {field: match.to_dict() for field, match in matches.items()},
        "warnings": warnings,
    }
