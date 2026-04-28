import React, { Fragment } from "react";
import { Link } from "react-router-dom";

const CmnHeader = ({
    title,
    subtitle,
    icon1,
    IconLucide,
    actionBtn,
    actionName,
    actionLink,
    actionVariant = "",
    actions = [],
    actionCmp,
}) => {

    const variantClasses = {
        ghost:
            "bg-transparent border-[#B0B0B0] border text-[#454545] rounded-[30px]  ",
        primary:
            "bg-[#1A71F6] text-white rounded-[30px] no-underline",
        danger:
            "bg-[#FF141F] text-white hover:bg-[#e3121b] rounded-[30px] ",
    };

    return (
        <Fragment>
            <div className="iwl-header">
                <div className="iwl-title-wrap">
                    <div className="iwl-icon">
                        {IconLucide ? (
                            <IconLucide size={18} />
                        ) : (
                            <i className={`${icon1}`} />
                        )}
                    </div>

                    <div>
                        <h2 className="text-[24px] font-semibold text-[#2A2A2A] font-roboto">
                            {title}
                        </h2>

                        <p className="iwl-subtitle">{subtitle}</p>
                    </div>
                </div>

                {(actionName || actions?.length > 0) && (
                    <div className="flex gap-2">

                        {/* Primary Single Action */}
                        {actionName &&
                            (actionLink ? (
                                <Link
                                    to={actionLink}
                                    className={`text-[12px] py-2 px-3 ${variantClasses[actionVariant]} visited:text-inherit no-underline text-[12px] flex gap-1 items-center`}
                                    onClick={actionBtn}
                                >   
                                   {actionName}
                                </Link>
                            ) : (
                                <button
                                    className={`text-[12px] py-2 px-3 ${variantClasses[actionVariant]} visited:text-inherit no-underline text-[12px]`}
                                    onClick={actionBtn}
                                >
                                    {actionName}
                                </button>
                            ))}

                        {/* Multiple Actions */}
                        {actions?.map((action, index) => (
                            action.link ? (
                                <Link
                                    key={index}
                                    to={action.link}
                                    className={`text-[12px] py-2 px-3 ${
                                        variantClasses[action.variant || "primary"]
                                    } flex items-center gap-2 visited:text-inherit no-underline text-[12px]`}
                                    onClick={action.onClick}
                                >
                                    {action.icon}
                                    {action.name}
                                </Link>
                            ) : (
                                <button
                                    key={index}
                                    className={`text-[12px] py-2 px-3 ${
                                        variantClasses[action.variant || "primary"]
                                    } flex items-center gap-2 visited:text-inherit no-underline text-[12px]`}
                                    onClick={action.onClick}
                                >
                                    {action.icon}
                                    {action.name}
                                </button>
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