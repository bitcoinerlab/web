import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import NotFound from "../notfound";
import ApiIframe from "./ApiIframe";

export default function DocsAndAPI({ API, docs }) {
  return (
    <>
      <nav className="docsAndAPIMenu">
        <ul>
          <li>
            <NavLink
              to={`/modules/${API}`}
              end /* Adding the end prop to the NavLink for "Docs" will ensure that the selected class is only applied when the location is exactly /modules/discovery .*/
              className={({ isActive }) => (isActive ? "selected" : undefined)}
            >
              {"Docs"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/modules/${API}/api`}
              className={({ isActive }) => (isActive ? "selected" : undefined)}
            >
              {"API"}
            </NavLink>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={docs} />
        <Route path="api/*" element={<ApiIframe API={API} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
