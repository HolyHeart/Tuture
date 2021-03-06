import { useDispatch, useSelector } from 'react-redux';
import { Modal, Input } from 'antd';
import { useSlate } from 'tuture-slate-react';

/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import { isMarkActive, insertLink, updateLink, selectLastPoint } from 'editure';
import { LINK } from 'editure-constants';

const EditLink = () => {
  const editor = useSlate();
  const dispatch = useDispatch();
  const { isEditing, text, url } = useSelector((state) => state.link);

  const handleOk = () => {
    // Go back to last selected point.
    selectLastPoint(editor);

    if (text) {
      if (!isMarkActive(editor, LINK)) {
        insertLink(editor, text, url);
      } else {
        updateLink(editor, text, url);
      }
    }

    dispatch({ type: 'link/reset' });
  };

  const handleCancel = () => {
    selectLastPoint(editor);
    dispatch({ type: 'link/reset' });
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      // Enter key.
      e.preventDefault();
      handleOk();
    }
  };

  console.log('text', text);

  return (
    <Modal
      title="添加/编辑链接"
      visible={isEditing}
      onOk={handleOk}
      onCancel={handleCancel}
      zIndex={1080}
      destroyOnClose
    >
      <p
        css={css`
          margin-top: 8px;
          margin-bottom: 8px;
        `}
      >
        文本
      </p>
      <Input
        value={text}
        autoFocus={!text}
        placeholder="添加描述"
        onKeyDown={onKeyDown}
        onChange={(e) =>
          dispatch({ type: 'link/setText', payload: e.target.value })
        }
      />
      <p
        css={css`
          margin-top: 8px;
          margin-bottom: 8px;
        `}
      >
        链接
      </p>
      <Input
        value={url}
        autoFocus={!!text}
        placeholder="链接地址"
        onKeyDown={onKeyDown}
        onChange={(e) =>
          dispatch({ type: 'link/setUrl', payload: e.target.value })
        }
      />
    </Modal>
  );
};

export default EditLink;
