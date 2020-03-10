import { BULLETED_LIST } from 'editure-constants';

/** @jsx jsx */
import { css, jsx } from '@emotion/core';

const bulletedListStyleType = ['disc', 'circle', 'square'];

function ListItemElement(props) {
  const { attributes, children, element } = props;
  const { parent, level, number } = element;

  const bulletedStyle = css`
    margin-left: ${(level || 0) * 2 + 2}em;
    list-style-type: ${bulletedListStyleType[element.level % 3]};
  `;

  const numberedStyle = css`
    ::before {
      content: "${number || 1}.  ";
    }
    margin-left: ${(level || 0) * 2 + 1}em;
    list-style-type: none;
  `;

  return (
    <li
      {...attributes}
      css={parent === BULLETED_LIST ? bulletedStyle : numberedStyle}
    >
      {children}
    </li>
  );
}

export default ListItemElement;
