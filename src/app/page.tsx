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
  const [keywords, setKeywords] = useState("");
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  

  const rankRepositories = (searchKeywords: string, repoList: GitHubRepo[]) => {
    if(!searchKeywords.trim()){
      setFilteredRepos([]);
      return;
    }

    const terms = searchKeywords.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    const scored = repoList.map((repo) => {
      let score = 0;

      terms.forEach((term) => {
        if(repo.name.toLowerCase().includes(term)) score += 50;
       if (repo.description?.toLowerCase().includes(term)) score += 30;
        
      if(repo.language?.toLowerCase() === term) score += 25;
      else if (repo.language?.toLowerCase().includes(term)) score += 15;
    });


      const starBonus = repo.stargazers_count > 0 
      ? Math.log10(repo.stargazers_count + 1) * 15 
      : 0;
    score += starBonus;

    const forkBonus = repo.forks_count > 0
      ? Math.log10(repo.forks_count + 1) * 10
      : 0;
    score += forkBonus;

    const daysSinceUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) score += 20;
    else if (daysSinceUpdate < 90) score += 10;

    return { ...repo, score };
  });

  // FIX 3: Filter out repos with 0 score (no matches at all)
  const relevant = scored.filter(repo => repo.score > 0);
  
  relevant.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.stargazers_count - a.stargazers_count;
  });

  // After sorting, find max score
  const maxScore = Math.max(...relevant.map(r => r.score));
const normalized = relevant.map(r => ({
  ...r,
  matchPercent: maxScore > 0 ? Math.round((r.score / maxScore) * 100) : 0
}));
  
  setFilteredRepos(relevant);
  setIsFiltering(false);
}



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
  <div className="mt-8 max-w-2xl mx-auto">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        🔍 Smart Project Finder
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Enter keywords to find the most relevant and popular projects (e.g., "react api machine learning")
      </p>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g., react frontend authentication"
          className="flex-1 px-4 py-2 text-black rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button
          onClick={() => {
            setIsFiltering(true);
            // Small delay so UI updates before heavy calculation
            setTimeout(() => rankRepositories(keywords, repos), 50);
          }}
          disabled={isFiltering || !keywords.trim()}
          className="px-5 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isFiltering ? "Analyzing..." : "Rank Projects"}
        </button>
      </div>

      {keywords.trim() && !isFiltering && filteredRepos.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-3">
            Found {filteredRepos.length} projects ranked by relevance
          </p>
          <div className="space-y-3">
            {filteredRepos.slice(0, 5).map((repo: any) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-purple-700 hover:text-purple-900 truncate"
                    >
                      {repo.name}
                    </a>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                      Score: {Math.round(repo.score)}
                    </span>
                  </div>
                  {repo.description && (
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {repo.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 ml-4 shrink-0">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {repo.language}
                    </span>
                  )}
                  <span>⭐ {repo.stargazers_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {keywords.trim() && !isFiltering && filteredRepos.length === 0 && (
        <p className="mt-4 text-sm text-red-600">
          No projects match these keywords. Try different terms.
        </p>
      )}
    </div>
  </div>
)}

    </main>
    </>
  );
}
