import io
import unicodedata


PAGE_WIDTH = 842
PAGE_HEIGHT = 595
LEFT = 34
RIGHT = 34
TOP = 42
BOTTOM = 34
ROW_HEIGHT = 18


def _plain(value):
    """Normaliza texto para las fuentes PDF base (ASCII/WinAnsi seguro)."""
    text = "-" if value is None or value == "" else str(value)
    return unicodedata.normalize("NFKD", text).encode("ascii", "replace").decode()


def _pdf_text(value):
    text = _plain(value).replace("\\", "\\\\")
    return text.replace("(", "\\(").replace(")", "\\)")


def _line(text, x, y, size=8, color="0.15 0.16 0.20"):
    return f"{color} rg BT /F1 {size} Tf {x:.1f} {y:.1f} Td ({_pdf_text(text)}) Tj ET"


def _page_content(headers, rows, title, page_number, total_pages, filters):
    width = PAGE_WIDTH - LEFT - RIGHT
    columns = max(len(headers), 1)
    col_width = width / columns
    max_rows = int((PAGE_HEIGHT - TOP - BOTTOM - 78) / ROW_HEIGHT)
    content = ["q", "1 1 1 rg 0 0 842 595 re f"]
    content.append(_line(title, LEFT, PAGE_HEIGHT - TOP, 16, "0.10 0.11 0.14"))
    metadata = f"Registros: {len(rows)}"
    if filters:
        active = " | ".join(f"{_plain(k)}: {_plain(v)}" for k, v in filters.items() if v)
        if active:
            metadata += f" | {active}"
    content.append(_line(metadata, LEFT, PAGE_HEIGHT - TOP - 18, 8, "0.38 0.40 0.47"))

    table_top = PAGE_HEIGHT - TOP - 42
    header_y = table_top - ROW_HEIGHT
    content.append("0.13 0.15 0.22 rg")
    content.append(f"{LEFT} {header_y} {width} {ROW_HEIGHT} re f")
    for index, header in enumerate(headers):
        content.append(_line(_plain(header)[:22], LEFT + index * col_width + 4, header_y + 5, 7, "1 1 1"))

    for row_index, row in enumerate(rows[:max_rows]):
        y = header_y - (row_index + 1) * ROW_HEIGHT
        if row_index % 2 == 1:
            content.append("0.97 0.98 0.99 rg")
            content.append(f"{LEFT} {y} {width} {ROW_HEIGHT} re f")
        content.append("0.88 0.89 0.92 RG 0.35 w")
        content.append(f"{LEFT} {y} {width} {ROW_HEIGHT} re S")
        for index, header in enumerate(headers):
            value = _plain(row.get(header))[:28]
            content.append(_line(value, LEFT + index * col_width + 4, y + 5, 7, "0.15 0.16 0.20"))

    content.append(_line(f"Pagina {page_number} de {total_pages}", PAGE_WIDTH - RIGHT - 75, 18, 7, "0.38 0.40 0.47"))
    content.append("Q")
    return "\n".join(content)


def build_pdf(headers, rows, sheet_title="Reporte", filters=None):
    """Devuelve un PDF multipagina construido en memoria con la biblioteca estandar."""
    columns = max(len(headers), 1)
    max_rows = int((PAGE_HEIGHT - TOP - BOTTOM - 78) / ROW_HEIGHT)
    pages = [rows[index:index + max_rows] for index in range(0, len(rows), max_rows)] or [[]]
    objects = []

    def add_object(value):
        objects.append(value)
        return len(objects)

    catalog_id = add_object(None)
    pages_id = add_object(None)
    font_id = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    page_ids = []
    for page_number, page_rows in enumerate(pages, start=1):
        content = _page_content(headers, page_rows, _plain(sheet_title), page_number, len(pages), filters or {})
        content_bytes = content.encode("latin-1", "replace")
        content_id = add_object(f"<< /Length {len(content_bytes)} >>\nstream\n{content}\nendstream")
        page_id = add_object(
            f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
            f"/Resources << /Font << /F1 {font_id} 0 R >> >> /Contents {content_id} 0 R >>"
        )
        page_ids.append(page_id)

    objects[catalog_id - 1] = f"<< /Type /Catalog /Pages {pages_id} 0 R >>"
    objects[pages_id - 1] = f"<< /Type /Pages /Kids [{' '.join(f'{pid} 0 R' for pid in page_ids)}] /Count {len(page_ids)} >>"

    output = io.BytesIO()
    output.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for object_id, value in enumerate(objects, start=1):
        offsets.append(output.tell())
        output.write(f"{object_id} 0 obj\n{value}\nendobj\n".encode("latin-1", "replace"))
    xref = output.tell()
    output.write(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode())
    for offset in offsets[1:]:
        output.write(f"{offset:010d} 00000 n \n".encode())
    output.write(
        f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\nstartxref\n{xref}\n%%EOF".encode()
    )
    return output.getvalue()
