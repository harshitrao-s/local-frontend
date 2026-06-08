import { Input } from "../../Components/Common/ui/input";
import React, { useState } from "react";

export default function VendorPortalCredentials() {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [credentials, setCredentials] = useState([]);

    const emptyForm = {
        portal_name: "",
        portal_url: "",
        username: "",
        password: "",
        account_number: "",
        mfa_enabled: false,
        last_login: "",
    };

    const [form, setForm] = useState(emptyForm);

    const handleSave = () => {
        if (!form.portal_name) return alert("Portal Name required");
        if (!form.portal_url) return alert("Portal URL required");

        if (editingId) {
            setCredentials((prev) =>
                prev.map((item) =>
                    item.id === editingId ? { ...form, id: editingId } : item
                )
            );
        } else {
            setCredentials((prev) => [
                ...prev,
                {
                    ...form,
                    id: Date.now(),
                    last_login:
                        new Date().toLocaleDateString() +
                        " " +
                        new Date().toLocaleTimeString(),
                },
            ]);
        }

        setForm(emptyForm);
        setEditingId(null);
        setShowModal(false);
    };

    const handleEdit = (item) => {
        setForm(item);
        setEditingId(item.id);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        setCredentials((prev) => prev.filter((x) => x.id !== id));
    };

    return (
        <>
            <div className=" bg-white">
                {/* Header */}

                <div className="flex items-center justify-between px-4">
                    <h3 className="font-semibold text-slate-800">
                         Portal Credentials
                    </h3>

                    <button
                        onClick={() => {
                            setEditingId(null);
                            setForm(emptyForm);
                            setShowModal(true);
                        }}
                        className="rounded-lg bg-[#1a71f6] px-2 py-2 text-sm font-medium text-white"
                    >
                        + Add Credential
                    </button>
                </div>

                {/* Cards */}

                <div className="space-y-4 p-4">
                    {credentials.length === 0 && (
                        <div className="rounded-lg border border-dashed p-8 text-center text-slate-400">
                            No Credentials Found
                        </div>
                    )}

                    {credentials.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-xl border border-slate-200 p-5"
                        >
                            <div className="flex justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                            🌐
                                        </div>

                                        <div>
                                            <h4 className="font-semibold">
                                                {item.portal_name}
                                            </h4>

                                            <p className="text-sm text-slate-500">
                                                Last Login: {item.last_login}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">
                                                URL:
                                            </span>{" "}
                                            {item.portal_url}
                                        </div>

                                        <div>
                                            <span className="font-medium">
                                                Username:
                                            </span>{" "}
                                            {item.username}
                                        </div>

                                        <div>
                                            <span className="font-medium">
                                                Account Number:
                                            </span>{" "}
                                            {item.account_number || "-"}
                                        </div>

                                        <div>
                                            <span className="font-medium">
                                                MFA:
                                            </span>{" "}
                                            {item.mfa_enabled ? (
                                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                                    Enabled
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                                                    Disabled
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
                                        One Click Login
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="rounded-md bg-slate-100 px-3 py-1 text-sm h-[30px]"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(item.id)
                                        }
                                        className="rounded-md bg-red-100 px-3 py-1 text-sm text-red-600 h-[30px]"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-2xl rounded-xl bg-white p-6">
                        <h2 className="mb-5 text-xl font-semibold">
                            {editingId
                                ? "Edit Credential"
                                : "Add Credential"}
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                placeholder="Portal Name"
                                className="rounded-lg border p-3"
                                value={form.portal_name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        portal_name: e.target.value,
                                    })
                                }
                            />

                            <Input
                                placeholder="Portal URL"
                                className="rounded-lg border p-3"
                                value={form.portal_url}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        portal_url: e.target.value,
                                    })
                                }
                            />

                            <Input
                                type="email"
                                placeholder="Username"
                                className="rounded-lg border p-3"
                                value={form.username}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        username: e.target.value,
                                    })
                                }
                            />

                            <Input
                                type="password"
                                placeholder="Password"
                                className="rounded-lg border p-3"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value,
                                    })
                                }
                            />

                            <Input
                                placeholder="Account Number"
                                type="number"
                                className="rounded-lg border p-3"
                                value={form.account_number}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        account_number: e.target.value,
                                    })
                                }
                            />

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.mfa_enabled}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            mfa_enabled: e.target.checked,
                                        })
                                    }
                                />
                                MFA Enabled
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg border px-4 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                className="rounded-lg bg-green-600 px-4 py-2 text-white"
                            >
                                Save Credential
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}