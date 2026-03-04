import { BrowserRouter as Router, Routes, Route } from "react-router";
import React, { Fragment } from "react";
import routes from "./routes";

function App() {
    return (
        <Router>
            <Routes>
                {routes.map((route, index) => {
                    const Layout = route.layout;
                    return (
                        <Route key={index} element={<Layout />}>
                            {route.children.map((child, index) => {
                                const Component = child.component;
                                const Wrapper = Fragment;
                                return (
                                    <Route
                                        key={index}
                                        path={child.path}
                                        element={
                                            <Wrapper>
                                                <Component />
                                            </Wrapper>
                                        }
                                    />
                                );
                            })}
                        </Route>
                    );
                })}
            </Routes>
        </Router>
    );
}

export default App;
