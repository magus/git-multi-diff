import * as React from "react";

import * as Ink from "ink";

type Props = {
  children: React.ReactNode;
};

export function Parens(props: Props) {
  const color = "#38bdf8";

  return (
    <Ink.Text>
      <Ink.Text color={color}>(</Ink.Text>
      {props.children}
      <Ink.Text color={color}>)</Ink.Text>
    </Ink.Text>
  );
}
