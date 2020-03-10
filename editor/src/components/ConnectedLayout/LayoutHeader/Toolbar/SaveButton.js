import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';

import { ButtonRefsContext } from 'utils/hotkeys';

import Button from './Button';
import ToolbarIcon from './ToolbarIcon';

const SaveButton = () => {
  const dispatch = useDispatch();
  const { saveBtnRef: ref } = useContext(ButtonRefsContext);

  const onClick = () => {
    dispatch.collection.saveCollection({ showMessage: true });
  };

  return (
    <Button handleClick={onClick} ref={ref}>
      <ToolbarIcon icon="icon-save" title="保存" />
    </Button>
  );
};

export default SaveButton;
