import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Icon, message, Modal } from 'antd';
import classnames from 'classnames';
import omit from 'lodash.omit';
import { useDispatch, useSelector, useStore } from 'react-redux';

/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import IconFont from 'components/IconFont';

const { Search } = Input;
const { confirm } = Modal;

const assistInfoStyle = css`
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: rgba(140, 140, 140, 1);
  line-height: 20px;
  margin-top: 8px;
`;

const containerStyle = css`
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(232, 232, 232, 1);
  padding-top: 32px;
  padding-bottom: 32px;
`;

const headerStyle = css`
  border-bottom: 1px solid #eeeeee;
  padding-bottom: 16px;
`;

const listItemStyle = css`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  background: rgba(247, 247, 250, 1);
  border-radius: 2px;
  border: 1px solid rgba(232, 232, 232, 1);
  padding-left: 16px;
  padding-right: 24px;
  margin-bottom: 16px;
`;

const listItemActionStyle = css`
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: rgba(140, 140, 140, 1);
  line-height: 22px;
`;

const activeListItemStyle = css`
  border: 1px solid #999999;
`;

function Toc() {
  const store = useStore();
  const dispatch = useDispatch();

  const defaultUnassignedStepList = useSelector(
    store.select.collection.getUnassignedStepList,
  );
  const defaultArticleStepList = useSelector(
    store.select.collection.getArticleStepList,
  );
  const isSaving = useSelector((state) => state.toc.isSaving);

  const [searchValue, setSearchValue] = useState('');
  const [activeArticle, setActiveArticle] = useState('');
  const [articleStepList, setArticleStepList] = useState(
    defaultArticleStepList,
  );
  const [unassignedStepList, setUnassignedStepList] = useState(
    defaultUnassignedStepList,
  );

  useEffect(() => {
    if (isSaving) {
      dispatch.toc.save({ articleStepList, unassignedStepList });
    }
  }, [articleStepList, dispatch.toc, isSaving, unassignedStepList]);

  const filteredArticleList = articleStepList.filter((articleStep) => {
    if (!articleStep?.articleId) {
      return true;
    }

    if (activeArticle === articleStep.articleId) {
      return true;
    }

    return false;
  });
  const filteredUnassignedStepList = unassignedStepList.filter((step) => {
    const isQualified = step.name.indexOf(searchValue);
    if (isQualified >= 0) {
      return true;
    }

    return false;
  });

  function toggleActiveArticle(articleId) {
    if (activeArticle === articleId) {
      setActiveArticle('');
    } else {
      setActiveArticle(articleId);
    }
  }

  function handleAddStep(stepItem) {
    if (!activeArticle) {
      message.warning('请选中文章，再添加步骤');
    } else {
      const targetArticleStepIndex = articleStepList.findIndex(
        (articleStep) =>
          articleStep?.articleId === activeArticle &&
          articleStep?.number > stepItem.number,
      );
      const articleStepsLen = articleStepList.filter(
        (articleStep) => articleStep?.articleId === activeArticle,
      ).length;

      if (targetArticleStepIndex < 0 && articleStepsLen === 0) {
        const articleIndex = articleStepList.findIndex(
          (articleStep) => articleStep.id === activeArticle,
        );

        const newArticleStepList = [
          ...articleStepList.slice(0, articleIndex + 1),
          { ...stepItem, articleId: activeArticle },
          ...articleStepList.slice(articleIndex + 1),
        ];
        setArticleStepList(newArticleStepList);
      } else if (targetArticleStepIndex < 0 && articleStepsLen > 0) {
        const articleIndex = articleStepList.findIndex(
          (articleStep) => articleStep.id === activeArticle,
        );

        const newArticleStepList = [
          ...articleStepList.slice(0, articleIndex + articleStepsLen + 1),
          { ...stepItem, articleId: activeArticle },
          ...articleStepList.slice(articleIndex + articleStepsLen + 1),
        ];
        setArticleStepList(newArticleStepList);
      } else {
        const newArticleStepList = [
          ...articleStepList.slice(0, targetArticleStepIndex),
          { ...stepItem, articleId: activeArticle },
          ...articleStepList.slice(targetArticleStepIndex),
        ];
        setArticleStepList(newArticleStepList);
      }

      const newUnassignedStepList = unassignedStepList.filter(
        (step) => step.id !== stepItem.id,
      );
      setUnassignedStepList(newUnassignedStepList);

      message.success('添加步骤成功');
    }
  }

  function handleInsertStep(step, stepList) {
    const insertIndex = stepList.findIndex(
      (stepItem) => stepItem.number > step.number,
    );

    if (insertIndex > -1) {
      const newStepList = [
        ...stepList.slice(0, insertIndex),
        omit(step, ['articleId']),
        ...stepList.slice(insertIndex),
      ];

      return newStepList;
    } else {
      const newStepList = stepList.concat(omit(step, ['articleId']));

      return newStepList;
    }
  }

  function handleArticleStepClick(e, articleStepItem) {
    e.preventDefault();
    e.stopPropagation();

    if (articleStepItem?.articleId) {
      const articleStepsLen = articleStepList.filter(
        (articleStep) => articleStep?.articleId === activeArticle,
      ).length;

      if (articleStepsLen === 1) {
        message.error('一篇文章至少包含一个步骤');
        return;
      }

      const newArticleStepList = articleStepList.filter(
        (articleStep) => articleStep.id !== articleStepItem.id,
      );

      setArticleStepList(newArticleStepList);

      const newUnassignedStepList = handleInsertStep(
        articleStepItem,
        unassignedStepList,
      );
      setUnassignedStepList(newUnassignedStepList);

      message.success('释放步骤成功');
    } else {
      showDeleteConfirm(articleStepItem);
    }
  }

  function handleDeleteArticle(articleStepItem) {
    const stepList = articleStepList.filter(
      (step) => step?.articleId === articleStepItem.id,
    );
    const newUnassignedStepList = stepList.reduce(
      (unassignedStepList, currentStep) =>
        handleInsertStep(currentStep, unassignedStepList),
      unassignedStepList,
    );
    const newArticleStepList = articleStepList
      .filter((step) => step?.articleId !== articleStepItem.id)
      .filter((step) => step.id !== articleStepItem.id);

    setUnassignedStepList(newUnassignedStepList);
    setArticleStepList(newArticleStepList);
    setActiveArticle('');

    message.success('删除文章成功');
  }

  function showDeleteConfirm(articleStepItem) {
    confirm({
      title: `确定删除文章 ${articleStepItem.name}？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        handleDeleteArticle(articleStepItem);
      },
    });
  }

  return (
    <div
      css={css`
        width: 1040px;
        margin: auto;
      `}
    >
      <Row>
        <Col
          span={8}
          css={css`
            box-sizing: border-box;
            padding-left: 12px;
            padding-right: 12px;
          `}
        >
          <div
            className="menu-wrapper step-list"
            css={css`
              ${containerStyle}
              padding-left: 24px;
              padding-right: 24px;
            `}
          >
            <div className="menu-header" css={headerStyle}>
              <h5
                css={css`
                  font-size: 16px;
                `}
              >
                待分配步骤
              </h5>

              <p css={assistInfoStyle}>把步骤分配给目录中对应的文章</p>
            </div>
            <div className="menu-body">
              <div
                className="step-list-filter"
                css={css`
                  width: 100%;
                  margin-top: 16px;
                  margin-bottom: 16px;
                `}
              >
                <Search
                  placeholder="搜索步骤的标题"
                  onSearch={(value) => setSearchValue(value)}
                  style={{ height: '40px' }}
                />
              </div>
              <ul
                className="step-list"
                css={css`
                  list-style: none;
                  padding: 0;
                  margin: 0;
                `}
              >
                {filteredUnassignedStepList.map((item) => (
                  <li
                    key={item.id}
                    css={css`
                      ${listItemStyle}
                      height: 52px;

                      &:hover .list-item-action {
                        visibility: visible;
                      }

                      &:hover {
                        cursor: pointer;
                      }
                    `}
                  >
                    <span
                      css={css`
                        width: 170px;
                        display: inline-block;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                      `}
                    >
                      {item.name}
                    </span>
                    <span
                      className="list-item-action"
                      onClick={() => handleAddStep(item)}
                      css={css`
                        ${listItemActionStyle}

                        display: flex;
                        align-items: center;
                        visibility: hidden;
                      `}
                    >
                      <span
                        css={css`
                          margin-right: 8px;
                        `}
                      >
                        添加
                      </span>
                      <IconFont
                        type="icon-doubleright"
                        css={css`
                          & > svg {
                            width: 8px;
                            height: 8px;
                          }
                        `}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Col>
        <Col
          span={16}
          css={css`
            box-sizing: border-box;

            padding-left: 12px;
            padding-right: 12px;
          `}
        >
          <div
            className="menu-wrapper page-list"
            css={css`
              ${containerStyle}
              padding-left: 56px;
              padding-right: 56px;
            `}
          >
            <div className="menu-header" css={headerStyle}>
              <h1
                css={css`
                  font-size: 30px;
                `}
              >
                文集目录
              </h1>
              <p css={assistInfoStyle}>
                选择文章，点击添加或拖拽左边的步骤进行分配
              </p>
            </div>
            <div className="menu-body">
              <ul
                className="step-list"
                css={css`
                  list-style: none;
                  padding: 0;
                  margin: 0;
                  margin-top: 16px;
                `}
              >
                {filteredArticleList.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      if (item.articleId) {
                        return;
                      }
                      toggleActiveArticle(item.id);
                    }}
                    className={classnames({
                      [`list-item-${item.articleId}`]: item.articleId,
                    })}
                    css={css`
                      ${listItemStyle}
                      height: 40px;
                      padding-left: 32px;

                      &:hover .list-item-action {
                        visibility: visible;
                      }

                      margin-left: ${item.level * 24}px;

                      &:hover {
                        cursor: pointer;
                      }

                      &:hover .list-item-tail {
                        display: none;
                      }

                      &:hover .list-item-action {
                        display: inline-block;
                      }

                      ${activeArticle === item.id && activeListItemStyle}
                    `}
                  >
                    {!item.articleId && (
                      <span
                        css={css`
                          position: absolute;
                          margin-left: -20px;
                          margin-top: -2px;
                        `}
                      >
                        <Icon
                          type={
                            activeArticle === item.id
                              ? 'caret-down'
                              : 'caret-right'
                          }
                          css={css`
                            & > svg {
                              width: 10px;
                              height: 10px;
                            }
                          `}
                        />
                      </span>
                    )}
                    <span>{item.name}</span>
                    {item.articleId && (
                      <span
                        className="list-item-tail"
                        css={css`
                          ${listItemActionStyle}
                        `}
                      >
                        步骤
                      </span>
                    )}

                    <span
                      className="list-item-action"
                      css={css`
                        ${listItemActionStyle}

                        display: none;
                      `}
                    >
                      <IconFont
                        type="icon-delete1"
                        onClick={(e) => handleArticleStepClick(e, item)}
                        css={css`
                          color: #8c8c8c;

                          &:hover {
                            color: #595959;
                            cursor: pointer;
                          }

                          & > svg {
                            width: 12px;
                            height: 12px;
                          }
                        `}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Toc;
