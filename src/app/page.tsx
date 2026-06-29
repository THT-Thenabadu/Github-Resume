"use client";

import { useState } from "react";

//Defining what a Github user looks like
interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
  created_at: string;
}

//Defining what a repo looks like 
interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  updated_at: string;
}


export default function Home() {
  
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);

  const [repos, setRepos] = useState<GitHubRepo[]>([]);

  const handlesubmit = async (e: React.FormEvent) => {

      e.preventDefault();
      if(!username.trim()) return;
      setLoading(true);

      try{
        //Fetching the user's profile
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        if(!userRes.ok) throw new Error("User not found");
        const userData: GitHubUser = await userRes.json();

        //Fetch Repos
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
        const reposData: GitHubRepo[] = await reposRes.json();

        setUser(userData);
        setRepos(reposData);

      } catch(error) {
        console.log(error);
        alert("failed to fetch Github data. Check the username and try again");

      } finally {
        setLoading(false);
      }
  };


  return (
    <>
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
    <div className="text-center max-w-md w-full">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Github Resume Generator
      </h1>
      <p className="text-gray-600 mb-8">
        Enter a Github username to generate a beautiful resume
      </p>

        <form onSubmit={handlesubmit} className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
          }
          placeholder="e.g., torvalds"
          className="flex-1 px-4 py-3 text-black rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        <button 
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? "loading.." : "Generate"}
        </button>
          
        </form>
    </div>

          {user && (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
              <div className="flex items-center gap-6">
                <img 
                  src={user.avatar_url}
                  alt={`${user.login}'s avatar`}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md"                
                />
                <div>
                  <h2 className="text-3xl font-bold">
                    {user.name || user.login}
                  </h2>
                  <p className="text-blue-100 text-lg">
                    @{user.login}
                  </p>
                  {user.bio && (
                    <p className="mt-2 text-blue-50">
                      {user.bio}
                    </p>
                  )}
                  {user.location && (
                    <p className="mt-1 text-blue-200 text-sm">📍{user.location}</p>
                  )}
                </div>
              </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200">
                <div className="p-6 text-center">
                  <p className="text-3xl font-bold text-gray-900">{user.public_repos}</p>
                  <p className="text-gray-500 text-sm uppercase tracking-wide mt-1">Repositories</p>
                </div>
                  <div className="p-6 text-center">
                  <p className="text-3xl font-bold text-gray-900">{user.followers}</p>
                  <p className="text-gray-500 text-sm uppercase tracking-wide mt-1">Followers</p>
                  </div>
                  <div className="p-6 text-center">
                    <p className="text-3xl font-bold text-gray-900">{user.following}</p>
                    <p className="text-gray-500 text-sm uppercase tracking-wide mt-1">Following</p>
                  </div>
              </div>


              <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📦</span> Top Repositories
                  </h3>



                  {repos.length === 0 ? (
                    <p className="text-gray-500">No Public repositories found.</p>
                  ):(
                    <div className="space-y-3">
                      {repos.map((repo)=> (
                        <div key={repo.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {repo.name}
                              </a>
                              {repo.description && (
                                <p className="text-gray-600 text-sm mt-1">
                                  {repo.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 ml-4">
                              {repo.language && (
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                  {repo.language}
                                </span>
                              )}
                              <span>⭐ {repo.stargazers_count}</span>
                              <span>🍴 {repo.forks_count}</span>
                            </div>
                          </div>
                          </div>
                      ))}
                      </div>
                  )}
              </div>

              <div className="bg-gray-50 p-4 text-center text-sm text-gray-500">
                Generated from Github data
                <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1">
                  View Profile
                </a>
              </div>
            </div>
          )}

    </main>
    </>
  );
}
