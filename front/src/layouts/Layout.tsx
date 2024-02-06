import {Outlet, Link, useNavigation} from "react-router-dom";

export const Layout = () => {
  let navigation = useNavigation();

  return (
      <div>
        <h1>Base Layout</h1>

        <p>
          BaseLayout
        </p>

        <div style={{ position: "fixed", top: 0, right: 0 }}>
          {navigation.state !== "idle" && <p>Navigation in progress...</p>}
        </div>

        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/sign-in">SignIn</Link>
            </li>
            <li>
              <Link to="/sign-up">SignUp</Link>
            </li>
            <li>
              <Link to="/404">404</Link>
            </li>
          </ul>
        </nav>

        <hr />

        {/* 본문 페이지 출력부분 */}
        <Outlet />
      </div>
  );
}