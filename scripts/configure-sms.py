"""Apply SMS credentials from stdin to the private deployment .env; never print them."""
import json
import os
from pathlib import Path
import re
import tempfile


def configure(path, settings):
    token = settings.get('token', '')
    centre = str(settings.get('costCentre', '20708'))
    if not isinstance(token, str) or not re.fullmatch(r'[A-Za-z0-9._~+/=-]+', token):
        raise ValueError('Invalid SMS token')
    if not re.fullmatch(r'[1-9][0-9]*', centre):
        raise ValueError('Invalid SMS cost centre')
    values = {'SMS_API_TOKEN': token, 'SMS_COST_CENTRE_ID': centre, 'SMS_ENABLED': 'true'}
    lines = path.read_text().splitlines()
    lines = [line for line in lines if not re.match(r'^\s*(?:export\s+)?(?:SMS_API_TOKEN|SMS_COST_CENTRE_ID|SMS_ENABLED)\s*=', line)]
    backup = path.with_name('.env.before-sms')
    with open(backup, 'w', opener=lambda name, flags: os.open(name, flags, 0o600)) as output:
        output.write(path.read_text())
    os.chmod(backup, 0o600)
    fd, temporary = tempfile.mkstemp(prefix='.env-sms-', dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as output:
            output.write('\n'.join(lines + [f'{key}={value}' for key, value in values.items()]) + '\n')
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


if __name__ == '__main__':
    import sys
    try:
        configure(Path('.env'), json.load(sys.stdin))
        print('Private SMS configuration applied; backup saved.')
    except Exception:
        print('SMS configuration failed; credentials were not printed.', file=sys.stderr)
        sys.exit(1)
