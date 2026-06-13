import { useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconExternalLink } from '@/components/ui/icons';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import styles from './UsageKeeperPage.module.scss';

const STORAGE_KEY_USAGE_KEEPER_URL = 'cli-proxy-usage-keeper-url';

const text = {
  title: '监控统计',
  description: 'CPA Usage Keeper',
  frameTitle: 'CPA Usage Keeper 监控统计',
  openExternal: '在新标签页打开',
  notConfiguredTitle: '填写 CPA Usage Keeper 地址',
  notConfiguredDescription: '请输入 CPA Usage Keeper 的前端访问地址。登录和会话由该服务自己处理。',
  serviceUrlLabel: '服务地址',
  serviceUrlPlaceholder: 'http://localhost:8080',
  serviceUrlHint: '建议使用与当前管理页相同的主机名，例如管理页是 localhost 时这里也填写 localhost。',
  saveAndOpen: '保存并打开',
  updateAddress: '更新地址',
  changeAddress: '修改地址',
  invalidUrl: '请输入有效的 http(s) 地址，或以 / 开头的同源路径。',
};

function normalizeUsageKeeperUrl(rawUrl: string) {
  const value = rawUrl.trim();
  if (!value) return '';

  try {
    const hasExplicitScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(value);
    const normalizedInput = hasExplicitScheme || value.startsWith('/') ? value : `http://${value}`;
    const base = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
    const url = new URL(normalizedInput, base);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return '';
    }

    if (normalizedInput.startsWith('/')) {
      return `${url.pathname}${url.search}${url.hash}`;
    }

    return url.href;
  } catch {
    return '';
  }
}

function getUsageKeeperCookieContext(frameUrl: string) {
  if (typeof window === 'undefined' || !frameUrl) {
    return null;
  }

  try {
    const currentUrl = new URL(window.location.href);
    const serviceUrl = new URL(frameUrl, currentUrl.origin);
    if (serviceUrl.hostname === currentUrl.hostname) {
      return null;
    }

    return {
      currentHost: currentUrl.hostname,
      serviceHost: serviceUrl.hostname,
    };
  } catch {
    return null;
  }
}

export function UsageKeeperPage() {
  const { t } = useTranslation();
  const [savedUrl, setSavedUrl] = useLocalStorage(STORAGE_KEY_USAGE_KEEPER_URL, '');
  const frameUrl = useMemo(() => normalizeUsageKeeperUrl(savedUrl), [savedUrl]);
  const [draftUrl, setDraftUrl] = useState(frameUrl);
  const [editing, setEditing] = useState(!frameUrl);
  const [formError, setFormError] = useState('');
  const cookieContext = useMemo(() => getUsageKeeperCookieContext(frameUrl), [frameUrl]);

  const showAddressForm = editing || !frameUrl;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedUrl = normalizeUsageKeeperUrl(draftUrl);
    if (!normalizedUrl) {
      setFormError(text.invalidUrl);
      return;
    }

    setSavedUrl(normalizedUrl);
    setDraftUrl(normalizedUrl);
    setEditing(false);
    setFormError('');
  };

  const handleEdit = () => {
    setDraftUrl(frameUrl || savedUrl);
    setFormError('');
    setEditing(true);
  };

  if (showAddressForm) {
    const hasExistingUrl = Boolean(frameUrl);

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h1 className={styles.pageTitle}>{text.title}</h1>
            <p className={styles.description}>{text.description}</p>
          </div>
        </div>

        <Card className={styles.messageCard} title={text.notConfiguredTitle}>
          <p className={styles.message}>{text.notConfiguredDescription}</p>
          <form className={styles.addressForm} onSubmit={handleSubmit}>
            <Input
              label={text.serviceUrlLabel}
              placeholder={text.serviceUrlPlaceholder}
              value={draftUrl}
              onChange={(event) => {
                setDraftUrl(event.target.value);
                if (formError) setFormError('');
              }}
              error={formError}
              hint={text.serviceUrlHint}
              autoFocus
            />
            <div className={styles.formActions}>
              {hasExistingUrl && (
                <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                  {t('common.cancel')}
                </Button>
              )}
              <Button type="submit">
                {hasExistingUrl ? text.updateAddress : text.saveAndOpen}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>{text.title}</h1>
          <p className={styles.description}>{text.description}</p>
        </div>
        <div className={styles.headerActions}>
          <Button type="button" variant="secondary" size="sm" onClick={handleEdit}>
            {text.changeAddress}
          </Button>
          <a
            className={styles.externalLink}
            href={frameUrl}
            target="_blank"
            rel="noreferrer"
            title={text.openExternal}
            aria-label={text.openExternal}
          >
            <IconExternalLink />
          </a>
        </div>
      </div>

      {cookieContext && (
        <div className={styles.cookieNotice}>
          当前管理页主机是 {cookieContext.currentHost}，服务地址主机是{' '}
          {cookieContext.serviceHost}。如果登录后请求仍没有 session
          cookie，请用相同主机名打开管理页和服务地址，或让 CPA Usage Keeper 的 cookie 支持跨站
          iframe。
        </div>
      )}

      <div className={styles.frameShell}>
        <iframe
          className={styles.frame}
          src={frameUrl}
          title={text.frameTitle}
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
