"""Configure only the approved first-access email; never overwrite operators' settings."""
import os
from pathlib import Path
import tempfile

path=Path('.env')
if not path.exists():
    print('Nova implantação: coonto.sh configure usará a indicação do .env.example.')
    raise SystemExit(0)
content=path.read_text()
key='COONTO_BOOTSTRAP_MASTER_EMAIL'
if any(line.strip().startswith(key+'=') for line in content.splitlines()):
    print('Configuração inicial existente preservada (inclusive se desativada).')
else:
    # This is not ADMIN_EMAILS: a database receipt prevents repeat promotions.
    content=content.rstrip()+'\n'+key+'=master@coonto.com\n'
    fd,temp=tempfile.mkstemp(prefix='.env-bootstrap-',dir='.')
    try:
        os.fchmod(fd,0o600)
        with os.fdopen(fd,'w') as stream:
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temp,path)
    finally:
        if os.path.exists(temp):os.unlink(temp)
    print('E-mail de inicialização configurado; requer confirmação por código de e-mail.')
