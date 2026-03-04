import React from "react";
import { Outlet } from "react-router";

function DefaultLayout() {
    return (
        <div>
            <main className="container mx-auto flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}

export default DefaultLayout;
