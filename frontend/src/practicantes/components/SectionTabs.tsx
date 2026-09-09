import { NavLink } from "react-router-dom";

export interface TabItem {
  to: string;
  label: string;
  end?: boolean;
}

export default function SectionTabs({ items }: { items: TabItem[] }) {
  return (
    <nav className="flex flex-wrap gap-2 mb-6">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => "tab-link " + (isActive ? "tab-link-active" : "")}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
