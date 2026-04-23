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
    actionLink
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
                        <h3 className="iwl-title">{title}</h3>
                        <p className="iwl-subtitle">
                            {subtitle}
                        </p>
                    </div>
                </div>
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
            </div>
        </Fragment>
    );
};

export default CmnHeader;