"""Content extraction from Payload CMS tables for embedding generation.

Extracts portfolio content from Supabase PostgreSQL tables (managed by
Payload CMS) and converts each record into a ContentChunk suitable for
vectorisation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import psycopg


@dataclass(frozen=True)
class ContentChunk:
    """An immutable chunk of portfolio content ready for embedding."""

    content: str
    source_type: str
    source_id: str
    metadata: dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _rows(conn: psycopg.Connection, sql: str) -> list[tuple[Any, ...]]:
    """Execute *sql* and return all rows as a list of tuples.

    .. note::
        *sql* must be a static SQL string literal.  Never pass dynamically
        constructed queries to this helper to avoid SQL-injection risks.
    """
    with conn.cursor() as cur:
        cur.execute(sql)
        return cur.fetchall()


def _coalesce(*values: str | None, sep: str = " | ") -> str:
    """Join non-empty string values with *sep*."""
    return sep.join(v for v in values if v)


# ---------------------------------------------------------------------------
# Per-collection extractors
# ---------------------------------------------------------------------------


def extract_projects(conn: psycopg.Connection) -> list[ContentChunk]:
    """Extract project records with their technologies and detail fields."""
    projects_sql = """
        SELECT id, title, company, description, period,
               team_size, key_achievement,
               detail_problem, detail_role, detail_architecture,
               detail_implementation, detail_impact, detail_learnings
        FROM projects
    """
    tech_sql = """
        SELECT _parent_id, value
        FROM projects_technologies
        ORDER BY _order
    """

    rows = _rows(conn, projects_sql)
    tech_rows = _rows(conn, tech_sql)

    # Group technologies by parent project id
    tech_by_project: dict[int, list[str]] = {}
    for parent_id, value in tech_rows:
        tech_by_project.setdefault(parent_id, []).append(value)

    chunks: list[ContentChunk] = []
    for row in rows:
        (
            pid, title, company, description, period,
            team_size, key_achievement,
            problem, role, architecture,
            implementation, impact, learnings,
        ) = row

        techs = tech_by_project.get(pid, [])
        tech_text = ", ".join(techs) if techs else ""

        detail_parts = _coalesce(
            problem, role, architecture,
            implementation, impact, learnings,
            sep="\n",
        )

        content = _coalesce(
            title,
            f"Company: {company}" if company else None,
            f"Period: {period}" if period else None,
            f"Team: {team_size}" if team_size else None,
            description,
            f"Key Achievement: {key_achievement}" if key_achievement else None,
            f"Technologies: {tech_text}" if tech_text else None,
            detail_parts if detail_parts else None,
            sep="\n",
        )

        chunks.append(ContentChunk(
            content=content,
            source_type="projects",
            source_id=str(pid),
            metadata={
                "title": title,
                "company": company,
                "technologies": techs,
            },
        ))

    return chunks


def extract_career(conn: psycopg.Connection) -> list[ContentChunk]:
    """Extract career records with their keywords."""
    career_sql = "SELECT id, period, company, role FROM career"
    kw_sql = """
        SELECT _parent_id, value
        FROM career_keywords
        ORDER BY _order
    """

    rows = _rows(conn, career_sql)
    kw_rows = _rows(conn, kw_sql)

    kw_by_career: dict[int, list[str]] = {}
    for parent_id, value in kw_rows:
        kw_by_career.setdefault(parent_id, []).append(value)

    chunks: list[ContentChunk] = []
    for cid, period, company, role in rows:
        keywords = kw_by_career.get(cid, [])
        kw_text = ", ".join(keywords) if keywords else ""

        content = _coalesce(
            f"{company} - {role}",
            f"Period: {period}" if period else None,
            f"Keywords: {kw_text}" if kw_text else None,
            sep="\n",
        )

        chunks.append(ContentChunk(
            content=content,
            source_type="career",
            source_id=str(cid),
            metadata={
                "company": company,
                "role": role,
                "keywords": keywords,
            },
        ))

    return chunks


def extract_skills(conn: psycopg.Connection) -> list[ContentChunk]:
    """Extract skill groups with their items."""
    skills_sql = "SELECT id, label, description FROM skills"
    items_sql = """
        SELECT _parent_id, value
        FROM skills_items
        ORDER BY _order
    """

    rows = _rows(conn, skills_sql)
    item_rows = _rows(conn, items_sql)

    items_by_skill: dict[int, list[str]] = {}
    for parent_id, value in item_rows:
        items_by_skill.setdefault(parent_id, []).append(value)

    chunks: list[ContentChunk] = []
    for sid, label, description in rows:
        items = items_by_skill.get(sid, [])
        items_text = ", ".join(items) if items else ""

        content = _coalesce(
            label,
            description,
            f"Skills: {items_text}" if items_text else None,
            sep="\n",
        )

        chunks.append(ContentChunk(
            content=content,
            source_type="skills",
            source_id=str(sid),
            metadata={"label": label, "items": items},
        ))

    return chunks


def extract_education(conn: psycopg.Connection) -> list[ContentChunk]:
    """Extract education records."""
    sql = "SELECT id, institution, degree, gpa, period FROM education"

    chunks: list[ContentChunk] = []
    for eid, institution, degree, gpa, period in _rows(conn, sql):
        content = _coalesce(
            f"{institution} - {degree}",
            f"GPA: {gpa}" if gpa else None,
            f"Period: {period}" if period else None,
            sep="\n",
        )

        chunks.append(ContentChunk(
            content=content,
            source_type="education",
            source_id=str(eid),
            metadata={"institution": institution, "degree": degree},
        ))

    return chunks


def extract_awards(conn: psycopg.Connection) -> list[ContentChunk]:
    """Extract award records."""
    sql = "SELECT id, title, date, organizer FROM awards"

    chunks: list[ContentChunk] = []
    for aid, title, date, organizer in _rows(conn, sql):
        content = _coalesce(
            title,
            f"Date: {date}" if date else None,
            f"Organizer: {organizer}" if organizer else None,
            sep="\n",
        )

        chunks.append(ContentChunk(
            content=content,
            source_type="awards",
            source_id=str(aid),
            metadata={"title": title},
        ))

    return chunks


def extract_publications(conn: psycopg.Connection) -> list[ContentChunk]:
    """Extract publication records."""
    sql = "SELECT id, title, journal, year, doi FROM publications"

    chunks: list[ContentChunk] = []
    for pid, title, journal, year, doi in _rows(conn, sql):
        content = _coalesce(
            title,
            f"Journal: {journal}" if journal else None,
            f"Year: {year}" if year else None,
            f"DOI: {doi}" if doi else None,
            sep="\n",
        )

        chunks.append(ContentChunk(
            content=content,
            source_type="publications",
            source_id=str(pid),
            metadata={"title": title, "journal": journal, "year": year},
        ))

    return chunks


def extract_certifications(conn: psycopg.Connection) -> list[ContentChunk]:
    """Extract certification records."""
    sql = "SELECT id, name, date, issuer FROM certifications"

    chunks: list[ContentChunk] = []
    for cid, name, date, issuer in _rows(conn, sql):
        content = _coalesce(
            name,
            f"Date: {date}" if date else None,
            f"Issuer: {issuer}" if issuer else None,
            sep="\n",
        )

        chunks.append(ContentChunk(
            content=content,
            source_type="certifications",
            source_id=str(cid),
            metadata={"name": name},
        ))

    return chunks


# ---------------------------------------------------------------------------
# Aggregate extractor
# ---------------------------------------------------------------------------

_EXTRACTORS = (
    extract_projects,
    extract_career,
    extract_skills,
    extract_education,
    extract_awards,
    extract_publications,
    extract_certifications,
)


def extract_all(conn: psycopg.Connection) -> list[ContentChunk]:
    """Run every extractor and return the combined list of chunks."""
    chunks: list[ContentChunk] = []
    for extractor in _EXTRACTORS:
        try:
            chunks = [*chunks, *extractor(conn)]
        except psycopg.Error as exc:
            raise RuntimeError(
                f"Extraction failed in {extractor.__name__}: {exc}"
            ) from exc
    return chunks
