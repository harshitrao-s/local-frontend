import React, { Fragment } from "react";
import { Link } from "react-router-dom";

const CmnHeader = ({
    title,
    subtitle,
    icon1:Icon,
    icon = "iwl-add-btn",
    actionBtn,
    actionName,
    actionLink
}) => {
    return (
        <Fragment>
            {/* Header */}
            <div className="flex align-items-center justify-between mb-4">
                <div className="iwl-title-wrap">
                    <div className="iwl-icon">
                    {Icon && <Icon size={18} />}
                    </div>
                    <div>
                        <h3 className="iwl-title">{title}</h3>
                        <p className="iwl-subtitle">
                            {subtitle}
                        </p>
                    </div>
                </div>

                {actionName && (
                    <Link
                        to={actionLink || "#"}
                        className={`${icon} no-underline text-white`}
                        onClick={actionBtn}
                    >
                        + {actionName}
                    </Link>
                )}
            </div>
        </Fragment>
    );
};

export default CmnHeader;