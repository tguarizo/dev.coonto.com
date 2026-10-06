"""Read only the configured proxy's state and recent startup logs."""
import re
import subprocess
from pathlib import Path

name=''
for line in Path('.env').read_text().splitlines():
    if line.startswith('CADDY_SERVICE='):
        name=line.split('=',1)[1].strip().strip('\"\'')
if not re.fullmatch(r'[A-Za-z0-9_.-]+',name):
    raise SystemExit('Nome do proxy ausente ou inválido.')
for command in [
    ['docker','inspect','--format','{{.Name}} {{.State.Status}} {{.State.Error}}',name],
    ['docker','logs','--tail','20',name],
]:
    result=subprocess.run(command,capture_output=True,text=True,timeout=15)
    output=result.stdout+result.stderr
    output=re.sub(r'(?i)((?:password|secret|token|code)=)[^\s&\"]+',r'\1[REDACTED]',output)
    print(output)
    if result.returncode:raise SystemExit(result.returncode)
