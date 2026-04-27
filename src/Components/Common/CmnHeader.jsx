import React, { Fragment } from "react";
import { Link } from "react-router-dom";

const CmnHeader = ({
    title,
    subtitle,
    icon1,
    IconLucide,
    icon = "iwl-add-btn",
    actionBtn,
    actionName,
    actionLink,
    actions = [],
    actionCmp,
}) => {


    return (
        <Fragment>
            {/* Header */}
            <div className="iwl-header">
                <div className="iwl-title-wrap">
                    <div className="iwl-icon">
                        {IconLucide ? <IconLucide size={18} /> : <i className={`${icon1}`} />}
                    </div>
                    <div>
                        <h2 className="text-[24px] font-semibold text-[#2A2A2A] font-roboto">{title}</h2>
                        <p className="iwl-subtitle">
                            {subtitle}
                        </p>
                    </div>
                </div>
                {(actionName || actions?.length > 0) && (
                    <div className="flex gap-2">

                        {/* 🔹 OLD SUPPORT (unchanged behavior) */}
                        {actionName && (
                            actionLink ? (
                                <Link
                                    to={actionLink}
                                    className={`${icon} no-underline text-white`}
                                    onClick={actionBtn}
                                >
                                    + {actionName}
                                </Link>
                            ) : (
                                <button
                                    className={`${icon}`}
                                    onClick={actionBtn}
                                >
                                    + {actionName}
                                </button>
                            )
                        )}

                        {/* 🔹 NEW MULTIPLE ACTIONS */}
                        {actions?.map((action, index) => (
                            action.link ? (
                                <Link
                                    key={index}
                                    to={action.link}
                                    className={`${icon} no-underline text-white`}
                                    onClick={action.onClick}
                                >
                                    {action.name}
                                </Link>
                            ) : (
                                <Link
                                    key={index}
                                    className={`${icon} no-underline text-white flex items-center gap-2 px-2`}
                                    onClick={action.onClick}
                                >
                                    {action.icon}
                                    {action.name}
                                </Link>
                            )
                        ))}
                       

                    </div>
                )}

                 {actionCmp && actionCmp}
            </div>
        </Fragment>
    );
};

export default CmnHeader;