"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { useLanguage } from "../../providers";
import { TrashIcon } from "../../components/icons";

type Permission = {
  key: string;
  description: string;
};

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
};

export default function AdminAccessPage() {
  const { t } = useLanguage();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  // Local edit buffer per role: name/description/permissions are tracked
  // until the user hits Save.
  const [drafts, setDrafts] = useState<
    Record<string, { name: string; description: string; permissions: Set<string> }>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const [permsResponse, rolesResponse] = await Promise.all([
        apiGet<{ items: Permission[] }>("auth/permissions"),
        apiGet<{ items: Role[] }>("roles"),
      ]);
      setPermissions(permsResponse.items);
      setRoles(rolesResponse.items);
      // Reset drafts to match the loaded state.
      const next: typeof drafts = {};
      for (const role of rolesResponse.items) {
        next[role.id] = {
          name: role.name,
          description: role.description ?? "",
          permissions: new Set(role.permissions),
        };
      }
      setDrafts(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.requestFailed);
    }
  }, [t.errors.requestFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  function togglePermission(roleId: string, permKey: string) {
    setDrafts((prev) => {
      const draft = prev[roleId];
      if (!draft) return prev;
      const next = new Set(draft.permissions);
      if (next.has(permKey)) {
        next.delete(permKey);
      } else {
        next.add(permKey);
      }
      return {
        ...prev,
        [roleId]: { ...draft, permissions: next },
      };
    });
  }

  function updateDraftField(
    roleId: string,
    field: "name" | "description",
    value: string,
  ) {
    setDrafts((prev) => {
      const draft = prev[roleId];
      if (!draft) return prev;
      return { ...prev, [roleId]: { ...draft, [field]: value } };
    });
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    setNotice(null);
    try {
      await apiSend("roles", "POST", {
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        permissions: [],
      });
      setNewName("");
      setNewDescription("");
      await load();
      setNotice(t.access.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.requestFailed);
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(role: Role) {
    const draft = drafts[role.id];
    if (!draft) return;
    setBusyId(role.id);
    setError(null);
    try {
      await apiSend(`roles/${role.id}`, "PATCH", {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        permissions: Array.from(draft.permissions),
      });
      await load();
      setNotice(t.access.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.requestFailed);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(role: Role) {
    if (!window.confirm(t.access.deleteConfirm)) return;
    setBusyId(role.id);
    setError(null);
    try {
      await apiSend(`roles/${role.id}`, "DELETE");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.requestFailed);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <h2 className="page-title">{t.access.title}</h2>
          <p className="page-copy">{t.access.subtitle}</p>
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}
      {notice ? <div className="notice success">{notice}</div> : null}

      <section className="panel">
        <div className="panel-head">
          <h3 className="section-title">{t.access.addTitle}</h3>
        </div>
        <form className="form-grid" onSubmit={handleCreate}>
          <label className="form-row">
            <span className="form-label">{t.access.nameLabel}</span>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </label>
          <label className="form-row">
            <span className="form-label">{t.access.descriptionLabel}</span>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </label>
          <div className="form-row form-row-actions">
            <button type="submit" className="btn primary" disabled={creating}>
              {creating ? t.common.loading : t.access.addButton}
            </button>
          </div>
        </form>
      </section>

      {roles.length === 0 ? (
        <div className="empty-state">{t.access.empty}</div>
      ) : (
        roles.map((role) => {
          const draft = drafts[role.id];
          if (!draft) return null;
          return (
            <section key={role.id} className="panel">
              <div className="panel-head" style={{ alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <input
                    type="text"
                    className="role-name-input"
                    value={draft.name}
                    onChange={(e) => updateDraftField(role.id, "name", e.target.value)}
                  />
                  <input
                    type="text"
                    className="role-desc-input"
                    placeholder={t.access.descriptionLabel}
                    value={draft.description}
                    onChange={(e) =>
                      updateDraftField(role.id, "description", e.target.value)
                    }
                  />
                  <div style={{ color: "var(--text-faint)", fontSize: 12 }}>
                    {role.userCount} {t.access.usersUsing}
                  </div>
                </div>
                <div className="action-row" style={{ flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => void handleSave(role)}
                    disabled={busyId === role.id}
                  >
                    {t.access.saveRole}
                  </button>
                  <button
                    type="button"
                    className="icon-btn danger"
                    title={t.access.deleteRole}
                    onClick={() => void handleDelete(role)}
                    disabled={busyId === role.id || role.userCount > 0}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              <div className="permissions-grid">
                {permissions.map((perm) => {
                  const checked = draft.permissions.has(perm.key);
                  return (
                    <label key={perm.key} className="perm-row">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(role.id, perm.key)}
                      />
                      <span>
                        <strong>{perm.key}</strong>
                        <span style={{ color: "var(--text-dim)", marginLeft: 8 }}>
                          {perm.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}
