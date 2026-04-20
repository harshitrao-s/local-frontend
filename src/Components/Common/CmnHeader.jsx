import React, { Fragment } from "react";

const CmnHeader = ({ title, subtitle, icon1,  icon = "iwl-add-btn", actionBtn, actionName }) => {
    return (
        <Fragment>
            {/* Header */}
            <div className="iwl-header">
                <div className="iwl-title-wrap">
                    <div className="iwl-icon">
                        <i className={`${icon1}`} />
                    </div>
                    <div>
                        <h3 className="iwl-title">{title}</h3>
                        <p className="iwl-subtitle">
                            {subtitle}
                        </p>
                    </div>
                </div>
{actionName && 
                <button
                    className={`${icon}`}
                    onClick={() =>
                        actionBtn()
                    }
                >
                    + {actionName}
                </button>}
            </div>

        </Fragment>
    )
}

export default CmnHeader