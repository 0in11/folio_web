"""Tests for content extraction from Payload CMS tables."""

from unittest.mock import MagicMock

from src.embeddings.extract import (
    ContentChunk,
    _coalesce,
    extract_all,
    extract_awards,
    extract_career,
    extract_certifications,
    extract_education,
    extract_projects,
    extract_publications,
    extract_skills,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _mock_conn(query_results: dict[str, list[tuple]]) -> MagicMock:
    """Create a mock psycopg Connection that returns pre-set rows per query.

    *query_results* maps a substring of the SQL query to the rows that
    should be returned when that query is executed.  Keys are matched
    longest-first so that ``"FROM projects_technologies"`` is preferred
    over ``"FROM projects"``.
    """
    # Sort keys longest-first to avoid partial prefix collisions.
    sorted_keys = sorted(query_results.keys(), key=len, reverse=True)

    # Each cursor() call returns a fresh context-manager mock so that
    # sequential queries inside the same function get independent state.
    conn = MagicMock()

    def _make_cursor():
        cur = MagicMock()
        ctx = MagicMock()
        ctx.__enter__ = MagicMock(return_value=cur)
        ctx.__exit__ = MagicMock(return_value=False)

        def _execute(sql):
            for key in sorted_keys:
                if key in sql:
                    cur.fetchall.return_value = query_results[key]
                    return
            cur.fetchall.return_value = []

        cur.execute.side_effect = _execute
        return ctx

    conn.cursor.side_effect = _make_cursor
    return conn


# ---------------------------------------------------------------------------
# ContentChunk dataclass
# ---------------------------------------------------------------------------


class TestContentChunk:
    def test_creation(self):
        chunk = ContentChunk(
            content="hello",
            source_type="test",
            source_id="1",
        )
        assert chunk.content == "hello"
        assert chunk.source_type == "test"
        assert chunk.source_id == "1"
        assert chunk.metadata == {}

    def test_with_metadata(self):
        chunk = ContentChunk(
            content="x",
            source_type="t",
            source_id="2",
            metadata={"key": "value"},
        )
        assert chunk.metadata == {"key": "value"}

    def test_is_frozen(self):
        chunk = ContentChunk(content="x", source_type="t", source_id="1")
        try:
            chunk.content = "y"  # type: ignore[misc]
            raise AssertionError("Should have raised FrozenInstanceError")
        except AttributeError:
            pass


# ---------------------------------------------------------------------------
# _coalesce helper
# ---------------------------------------------------------------------------


class TestCoalesce:
    def test_joins_non_empty(self):
        assert _coalesce("a", "b", "c") == "a | b | c"

    def test_skips_none_and_empty(self):
        assert _coalesce("a", None, "", "b") == "a | b"

    def test_custom_separator(self):
        assert _coalesce("x", "y", sep="\n") == "x\ny"

    def test_all_empty(self):
        assert _coalesce(None, "", None) == ""


# ---------------------------------------------------------------------------
# extract_projects
# ---------------------------------------------------------------------------


class TestExtractProjects:
    def test_basic_project(self):
        conn = _mock_conn({
            "FROM projects": [
                (1, "ML Pipeline", "Acme", "Built ML pipeline", "2024",
                 "3", "50% faster", None, None, None, None, None, None),
            ],
            "FROM projects_technologies": [
                (1, "Python"),
                (1, "TensorFlow"),
            ],
        })

        chunks = extract_projects(conn)

        assert len(chunks) == 1
        chunk = chunks[0]
        assert chunk.source_type == "projects"
        assert chunk.source_id == "1"
        assert "ML Pipeline" in chunk.content
        assert "Acme" in chunk.content
        assert "Python, TensorFlow" in chunk.content
        assert chunk.metadata["technologies"] == ["Python", "TensorFlow"]

    def test_project_with_detail_fields(self):
        conn = _mock_conn({
            "FROM projects": [
                (2, "Chatbot", "Corp", "AI chatbot", "2023",
                 "5", "High accuracy",
                 "Problem desc", "My role", None, "Impl details", None, None),
            ],
            "FROM projects_technologies": [],
        })

        chunks = extract_projects(conn)

        assert len(chunks) == 1
        assert "Problem desc" in chunks[0].content
        assert "My role" in chunks[0].content
        assert "Impl details" in chunks[0].content

    def test_empty_projects(self):
        conn = _mock_conn({
            "FROM projects": [],
            "FROM projects_technologies": [],
        })

        assert extract_projects(conn) == []


# ---------------------------------------------------------------------------
# extract_career
# ---------------------------------------------------------------------------


class TestExtractCareer:
    def test_basic_career(self):
        conn = _mock_conn({
            "FROM career": [
                (1, "2022-2024", "BigCo", "ML Engineer"),
            ],
            "FROM career_keywords": [
                (1, "NLP"),
                (1, "LLM"),
            ],
        })

        chunks = extract_career(conn)

        assert len(chunks) == 1
        chunk = chunks[0]
        assert chunk.source_type == "career"
        assert chunk.source_id == "1"
        assert "BigCo" in chunk.content
        assert "ML Engineer" in chunk.content
        assert "NLP, LLM" in chunk.content
        assert chunk.metadata["keywords"] == ["NLP", "LLM"]

    def test_career_no_keywords(self):
        conn = _mock_conn({
            "FROM career": [(2, "2020-2022", "StartupX", "Dev")],
            "FROM career_keywords": [],
        })

        chunks = extract_career(conn)
        assert len(chunks) == 1
        assert "Keywords" not in chunks[0].content

    def test_empty_career(self):
        conn = _mock_conn({
            "FROM career": [],
            "FROM career_keywords": [],
        })
        assert extract_career(conn) == []


# ---------------------------------------------------------------------------
# extract_skills
# ---------------------------------------------------------------------------


class TestExtractSkills:
    def test_basic_skills(self):
        conn = _mock_conn({
            "FROM skills": [(1, "Backend", "Server-side development")],
            "FROM skills_items": [(1, "Python"), (1, "Go")],
        })

        chunks = extract_skills(conn)

        assert len(chunks) == 1
        assert chunks[0].source_type == "skills"
        assert "Backend" in chunks[0].content
        assert "Python, Go" in chunks[0].content
        assert chunks[0].metadata["items"] == ["Python", "Go"]

    def test_empty_skills(self):
        conn = _mock_conn({
            "FROM skills": [],
            "FROM skills_items": [],
        })
        assert extract_skills(conn) == []


# ---------------------------------------------------------------------------
# extract_education
# ---------------------------------------------------------------------------


class TestExtractEducation:
    def test_basic_education(self):
        conn = _mock_conn({
            "FROM education": [
                (1, "Seoul Univ", "BS Computer Science", "4.0", "2016-2020"),
            ],
        })

        chunks = extract_education(conn)

        assert len(chunks) == 1
        assert chunks[0].source_type == "education"
        assert "Seoul Univ" in chunks[0].content
        assert "BS Computer Science" in chunks[0].content
        assert "GPA: 4.0" in chunks[0].content

    def test_education_without_gpa(self):
        conn = _mock_conn({
            "FROM education": [(2, "MIT", "MS AI", None, "2020-2022")],
        })

        chunks = extract_education(conn)
        assert "GPA" not in chunks[0].content


# ---------------------------------------------------------------------------
# extract_awards
# ---------------------------------------------------------------------------


class TestExtractAwards:
    def test_basic_award(self):
        conn = _mock_conn({
            "FROM awards": [(1, "Best Paper", "2023-06", "IEEE")],
        })

        chunks = extract_awards(conn)

        assert len(chunks) == 1
        assert chunks[0].source_type == "awards"
        assert "Best Paper" in chunks[0].content
        assert "IEEE" in chunks[0].content

    def test_award_without_organizer(self):
        conn = _mock_conn({
            "FROM awards": [(2, "Prize", "2024", None)],
        })
        chunks = extract_awards(conn)
        assert "Organizer" not in chunks[0].content


# ---------------------------------------------------------------------------
# extract_publications
# ---------------------------------------------------------------------------


class TestExtractPublications:
    def test_basic_publication(self):
        conn = _mock_conn({
            "FROM publications": [
                (1, "My Paper", "Nature", 2024, "10.1234/test"),
            ],
        })

        chunks = extract_publications(conn)

        assert len(chunks) == 1
        assert chunks[0].source_type == "publications"
        assert "My Paper" in chunks[0].content
        assert "Nature" in chunks[0].content
        assert "DOI: 10.1234/test" in chunks[0].content
        assert chunks[0].metadata["year"] == 2024

    def test_publication_without_doi(self):
        conn = _mock_conn({
            "FROM publications": [(2, "Other", "Conf", 2023, None)],
        })
        chunks = extract_publications(conn)
        assert "DOI" not in chunks[0].content


# ---------------------------------------------------------------------------
# extract_certifications
# ---------------------------------------------------------------------------


class TestExtractCertifications:
    def test_basic_certification(self):
        conn = _mock_conn({
            "FROM certifications": [(1, "AWS SA", "2023-01", "Amazon")],
        })

        chunks = extract_certifications(conn)

        assert len(chunks) == 1
        assert chunks[0].source_type == "certifications"
        assert "AWS SA" in chunks[0].content
        assert "Amazon" in chunks[0].content

    def test_certification_without_issuer(self):
        conn = _mock_conn({
            "FROM certifications": [(2, "CKA", "2024", None)],
        })
        chunks = extract_certifications(conn)
        assert "Issuer" not in chunks[0].content


# ---------------------------------------------------------------------------
# extract_all
# ---------------------------------------------------------------------------


class TestExtractAll:
    def test_combines_all_extractors(self):
        """extract_all should return chunks from every collection."""
        conn = _mock_conn({
            "FROM projects": [
                (1, "Proj", "Co", "Desc", "2024", "2", "Ach",
                 None, None, None, None, None, None),
            ],
            "FROM projects_technologies": [],
            "FROM career": [(1, "2024", "Co", "Dev")],
            "FROM career_keywords": [],
            "FROM skills": [(1, "ML", "Machine Learning")],
            "FROM skills_items": [],
            "FROM education": [(1, "Univ", "BS", "3.9", "2020")],
            "FROM awards": [(1, "Award", "2023", "Org")],
            "FROM publications": [(1, "Paper", "Journal", 2024, None)],
            "FROM certifications": [(1, "Cert", "2024", "Issuer")],
        })

        chunks = extract_all(conn)

        source_types = {c.source_type for c in chunks}
        assert source_types == {
            "projects", "career", "skills", "education",
            "awards", "publications", "certifications",
        }
        assert len(chunks) == 7

    def test_empty_database(self):
        conn = _mock_conn({})
        chunks = extract_all(conn)
        assert chunks == []
