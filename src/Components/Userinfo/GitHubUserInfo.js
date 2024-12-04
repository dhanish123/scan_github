import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setUsername,
  setUserData,
  setFollowers,
  setIsLoading,
  setLanguageData,
  setCurrentPage,
} from "../Redux Store/userSlice"; // Import actions
import { FaUser } from "react-icons/fa";
import { PiUsersThreeFill } from "react-icons/pi";
import { GoProjectSymlink } from "react-icons/go";
import LanguagePieChart from "../Chart/LanguagePieChart";
import "../../Components/Userinfo/GitHubUserInfo.scss";

const GitHubUserInfo = () => {
  const dispatch = useDispatch();
  const {
    username,
    userData,
    followers,
    isLoading,
    currentPage,
    followersPerPage,
  } = useSelector((state) => state.user);

  const [searchInput, setSearchInput] = useState("");

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const filteredFollowers = Array.isArray(followers)
    ? followers.filter((follower) => {
        const followerUsername = follower.login.toLowerCase();
        return followerUsername.includes(searchInput.toLowerCase());
      })
    : [];

  // const handleUsernameChange = (e) => {
  //   const inputUsername = e.target.value;
  //   if (inputUsername.trim() !== '') {
  //     dispatch(setUsername(inputUsername));
  //   }
  // };
  const handleUsernameChange = (e) => {
    const inputUsername = e.target.value;
    setSearchInput(inputUsername); // Ensure local state updates for real-time rendering
    dispatch(setUsername(inputUsername)); // Update Redux state with the current input
  };

  const fetchLanguageData = async () => {
    if (!username) return;
    const headers = {
      Authorization: `token ${process.env.REACT_APP_GITHUB_TOKEN}`,
    };
    // const headers = {
    //   Authorization: `token ${process.env.REACT_APP_GITHUB_TOKEN}`,
    // };


    try {
      const userDataResponse = await fetch(
        `https://api.github.com/users/${username}`,
        { headers }
      );
      const userData = await userDataResponse.json();
      dispatch(setUserData(userData));

      const followersResponse = await fetch(
        `https://api.github.com/users/${username}/followers`,
        { headers }
      );
      const followersData = await followersResponse.json();
      dispatch(setFollowers(followersData));

      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos`,
        { headers }
      );
      const reposData = await reposResponse.json();

      const languages = {};
      reposData.forEach((repo) => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      });

      const languageData = Object.keys(languages).map((language) => ({
        label: language,
        value: languages[language],
      }));

      dispatch(setLanguageData(languageData));
    } catch (error) {
      console.error("Error fetching language data:", error);
    }
  };

  useEffect(() => {
    fetchLanguageData();
  }, [username]);

  const startIndex = (currentPage - 1) * followersPerPage;
  const endIndex = startIndex + followersPerPage;

  const showPagination = followers.length > 4;

  return (
    <div className="git">
      <h1 className="git__head">GitHub User Search</h1>
      <input
        className="git__head-searchbox"
        type="text"
        placeholder="Enter GitHub username"
        value={username}
        onChange={handleUsernameChange}
      />

      {/* Cards for followers, following, & repositories */}
      <div className="allcards">
        <div className="allcards__card">
          <FaUser />
          <h2 className="allcards__cardhead">Followers</h2>
          <p className="allcards__cardnum">{userData && userData.followers}</p>
        </div>
        <div className="allcards__card">
          <PiUsersThreeFill />
          <h2 className="allcards__cardhead">Following</h2>
          <p className="allcards__cardnum">{userData && userData.following}</p>
        </div>
        <div className="allcards__card">
          <GoProjectSymlink />
          <h2 className="allcards__cardhead">Repositories</h2>
          <p className="allcards__cardnum">{userData && userData.public_repos}</p>
        </div>
      </div>

      <div className="section3">
        {userData && (
          <div className="section3__userinfo">
            <h2 className="section3__userhead">User</h2>
            <div className="section3__carduser">
              <img src={userData.avatar_url} alt={`${userData.login}'s avatar`} />
              <p className="section3__username">Name: {userData.name}</p>
              <p className="section3__userabout">
                About: {userData.bio || "Not Found"}
              </p>
              <p className="section3__userloc">
                Location: {userData.location || "Not Found"}
              </p>
            </div>
          </div>
        )}

        {isLoading && <p>Loading...</p>}

        <div className="section3__followertable">
          {filteredFollowers.length > 0 && (
            <div className="section3__userfollower">
              <div className="section3__userfollower__tablehead">
                <h2 className="section3__table">Followers</h2>
                <input
                  className="section3__userfollower__tablehead-searchbox"
                  type="text"
                  placeholder="Search followers"
                  value={searchInput}
                  onChange={handleSearchInputChange}
                />
              </div>
              <div className="section3__table-container">
                <table>
                  <thead>
                    <tr className="section3__tablehead">
                      <th>Avatar</th>
                      <th>Username</th>
                      <th>Profile URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFollowers
                      .slice(startIndex, endIndex)
                      .map((follower) => (
                        <tr key={follower.id}>
                          <td>
                            <img
                              src={follower.avatar_url}
                              alt={`${follower.login}'s avatar`}
                              width="50"
                            />
                          </td>
                          <td>{follower.login}</td>
                          <td>
                            <a
                              href={follower.html_url}
                              target="_blank"
                              className="section3__tableurl"
                              rel="noopener noreferrer"
                            >
                              click here
                            </a>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showPagination && (
            <div className="pagination">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    dispatch(setCurrentPage(currentPage - 1));
                  }
                }}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={() => {
                  if (endIndex < followers.length) {
                    dispatch(setCurrentPage(currentPage + 1));
                  }
                }}
                disabled={currentPage === Math.ceil(followers.length / followersPerPage)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="chart">
        <LanguagePieChart />
      </div>
    </div>
  );
};

export default GitHubUserInfo;
