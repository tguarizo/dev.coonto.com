#!/usr/bin/env python3
"""Authorize an operator-selected email for fresh email OTP in dev only.

Requires server filesystem access. Does not grant a database role, bypass OTP,
read an old key, remove an administrator, or print environment secrets.
"""
import argparse
import json
import os
from pathlib import Path
import re
import shlex
import stat
import tempfile
from urllib.parse import urlsplit

KEYS = {'DOMAIN', 'APP_URL', 'AUTH_MODE', 'ADMIN_EMAILS'}
ASSIGN = re.compile(r'^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$')
EMAIL = re.compile(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,63}$')


def parse(content):
    values, positions = {}, {}
    for index, line in enumerate(content.splitlines(keepends=True)):
        match = ASSIGN.match(line.rstrip('\r\n'))
        if not match or match[1] not in KEYS:
            continue
        key = match[1]
        if key in values:
            raise ValueError('Duplicate administrative configuration; manual inspection required.')
        lexer = shlex.shlex(match[2], posix=True)
        lexer.whitespace_split = True
        lexer.commenters = '#'
        tokens = list(lexer)
        if len(tokens) > 1:
            raise ValueError('Ambiguous administrative configuration.')
        values[key] = tokens[0] if tokens else ''
        positions[key] = index
    return values, positions


def prepare(content, email):
    email = email.strip().lower()
    if len(email) > 320 or not EMAIL.fullmatch(email):
        raise ValueError('Invalid administrator email.')
    values, positions = parse(content)
    if values.get('DOMAIN', '').lower() != 'dev.coonto.com':
        raise ValueError('Recovery is restricted to DOMAIN=dev.coonto.com.')
    if values.get('APP_URL'):
        url = urlsplit(values['APP_URL'])
        if url.scheme != 'https' or url.hostname != 'dev.coonto.com' or url.port not in (None, 443):
            raise ValueError('APP_URL does not match the approved dev environment.')
    if values.get('AUTH_MODE') != 'email':
        raise ValueError('Real email OTP must be enabled before recovery.')
    admins = [value.strip() for value in values.get('ADMIN_EMAILS', '').split(',') if value.strip()]
    if any(not EMAIL.fullmatch(value) for value in admins):
        raise ValueError('Existing administrator list is not a literal email list.')
    if email in [value.lower() for value in admins]:
        return content, False
    admins.append(email)
    newline = '\r\n' if '\r\n' in content else '\n'
    assignment = 'ADMIN_EMAILS=' + ','.join(admins) + newline
    lines = content.splitlines(keepends=True)
    if 'ADMIN_EMAILS' in positions:
        lines[positions['ADMIN_EMAILS']] = assignment
        return ''.join(lines), True
    return content + ('' if not content or content.endswith(('\r', '\n')) else newline) + assignment, True


def apply(path, email, commit=False):
    path = Path(path)
    if path.is_symlink() or not path.is_file():
        raise ValueError('Expected an existing regular environment file.')
    original_stat = path.stat()
    content = path.read_bytes().decode('utf-8')
    updated, changed = prepare(content, email)
    if changed and commit:
        fd, temp_name = tempfile.mkstemp(prefix='.env-admin-recovery-', dir=path.parent)
        try:
            os.fchmod(fd, stat.S_IMODE(original_stat.st_mode) & 0o600 or 0o600)
            if hasattr(os, 'fchown'):
                os.fchown(fd, original_stat.st_uid, original_stat.st_gid)
            with os.fdopen(fd, 'wb') as output:
                output.write(updated.encode('utf-8'))
                output.flush()
                os.fsync(output.fileno())
            os.replace(temp_name, path)
        finally:
            if os.path.exists(temp_name):
                os.unlink(temp_name)
    return {'changed': changed, 'applied': commit, 'fresh_email_otp_required': True}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--env', default='.env')
    parser.add_argument('--email', required=True)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    try:
        print(json.dumps(apply(args.env, args.email, args.apply)))
    except (ValueError, OSError, UnicodeError):
        # Do not include exceptions carrying environment values in action logs.
        parser.exit(1, 'Administrator recovery stopped; configuration was not printed.\n')


if __name__ == '__main__':
    main()
