class PatternIndexError(Exception):
    """Base error for expected pipeline failures."""


class ValidationError(PatternIndexError):
    """Raised when a normalized launch record is invalid."""


class MissingCredentialError(PatternIndexError):
    """Raised when an adapter credential is not configured."""

