import os

import pytest


def main():
    """Run all tests."""
    # Ensure we're in the correct directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Run tests
    pytest.main(["-v", "tests/"])


if __name__ == "__main__":
    main()
