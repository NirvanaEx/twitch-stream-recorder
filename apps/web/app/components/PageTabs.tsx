"use client";

export type PageTab<Id extends string> = {
  id: Id;
  label: string;
  /** Optional count shown next to the label — usually "how many rows are in there". */
  count?: number;
  /** Draws the count as a warning, for tabs that hold something wrong. */
  alert?: boolean;
};

/**
 * Tabs inside a panel, the same shape the settings page already used.
 *
 * They exist to stop a page from being one long column of unrelated tables:
 * "how full is the disk", "which folders", "which files" and "what is missing"
 * are four separate questions, and stacking them meant scrolling past three
 * answers to reach the one being asked.
 */
export function PageTabs<Id extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: PageTab<Id>[];
  active: Id;
  onChange: (id: Id) => void;
}) {
  return (
    <div className="tab-bar" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`tab-btn${active === tab.id ? " active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {typeof tab.count === "number" ? (
            <span className={`tab-count${tab.alert && tab.count > 0 ? " alert" : ""}`}>
              {tab.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
