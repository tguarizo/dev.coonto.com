import importlib.util
import os
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('recovery', Path(__file__).resolve().parent.parent / 'scripts/recover-admin-access.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
BASE = 'DOMAIN=dev.coonto.com\nAPP_URL=https://dev.coonto.com\nAUTH_MODE=email\nADMIN_EMAILS=existing@example.com\nSMTP_PASSWORD=fixture-secret-only\nCOONTO_BOOTSTRAP_MASTER_EMAIL=master@coonto.com\n'
TARGET = 'tony.guarizo@coonto.com'


class RecoveryTests(unittest.TestCase):
    def test_preserves_other_settings_and_existing_admins(self):
        updated, changed = module.prepare(BASE, TARGET)
        self.assertTrue(changed)
        self.assertEqual(updated.replace('ADMIN_EMAILS=existing@example.com,' + TARGET, 'ADMIN_EMAILS=existing@example.com'), BASE)

    def test_idempotent_case_insensitive(self):
        updated, _ = module.prepare(BASE, TARGET)
        self.assertEqual(module.prepare(updated, TARGET.upper()), (updated, False))

    def test_requires_real_otp_and_dev_domain(self):
        for source in [BASE.replace('AUTH_MODE=email', 'AUTH_MODE=validation'), BASE.replace('DOMAIN=dev.coonto.com', 'DOMAIN=coonto.com'), BASE.replace('APP_URL=https://dev.coonto.com', 'APP_URL=https://other.example')]:
            with self.assertRaises(ValueError): module.prepare(source, TARGET)

    def test_refuses_duplicate_config_and_injections(self):
        with self.assertRaises(ValueError): module.prepare(BASE + 'ADMIN_EMAILS=other@example.com\n', TARGET)
        with self.assertRaises(ValueError): module.prepare(BASE, 'x@example.com\nAUTH_MODE=validation')
        for email in ['x`whoami`@example.com', 'x$USER@example.com', 'x&echo@example.com']:
            with self.assertRaises(ValueError): module.prepare(BASE, email)
        with self.assertRaises(ValueError): module.prepare(BASE.replace('existing@example.com', '${SOME_VAR}'), TARGET)

    def test_handles_quoted_allowlist_and_empty_list(self):
        source = BASE.replace('ADMIN_EMAILS=existing@example.com', "export ADMIN_EMAILS='first@example.com,second@example.com' # note")
        updated, _ = module.prepare(source, TARGET)
        self.assertIn('ADMIN_EMAILS=first@example.com,second@example.com,' + TARGET, updated)
        source = BASE.replace('ADMIN_EMAILS=existing@example.com\n', '')
        self.assertIn('ADMIN_EMAILS=' + TARGET, module.prepare(source, TARGET)[0])

    def test_preserves_crlf(self):
        updated, _ = module.prepare(BASE.replace('\n', '\r\n'), TARGET)
        self.assertNotIn('\n', updated.replace('\r\n', ''))

    def test_dry_run_and_atomic_apply(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / '.env'
            path.write_text(BASE)
            os.chmod(path, 0o600)
            result = module.apply(path, TARGET)
            self.assertFalse(result['applied'])
            self.assertEqual(path.read_text(), BASE)
            result = module.apply(path, TARGET, True)
            self.assertTrue(result['applied'])
            self.assertIn(TARGET, path.read_text())
            self.assertEqual(path.stat().st_mode & 0o777, 0o600)
            self.assertTrue(result['fresh_email_otp_required'])

    def test_refuses_symlink(self):
        with tempfile.TemporaryDirectory() as folder:
            real = Path(folder) / 'real'
            real.write_text(BASE)
            link = Path(folder) / '.env'
            link.symlink_to(real)
            with self.assertRaises(ValueError): module.apply(link, TARGET, True)


if __name__ == '__main__': unittest.main()
