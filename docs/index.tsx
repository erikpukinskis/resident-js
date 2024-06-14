import { DocsApp } from "codedocs";
import React from "react";
import { render } from "react-dom";
import * as HomePage from "./HomePage.docs";

render(
  <DocsApp logo="Identic" docs={[HomePage]} />,
  document.getElementById("root")
);
