#!/usr/bin/env bash

set -e

echo "======================================"
echo " LekhaPulse Backend Verification"
echo "======================================"
echo

echo "1/2 Django system checks..."
python manage.py check

echo
echo "2/2 Running backend test suite..."
python manage.py test -v 1

echo
echo "======================================"
echo " Verification PASSED"
echo "======================================"
