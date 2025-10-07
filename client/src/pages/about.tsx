import React from "react";

const techStack = [
  { name: "React", icon: "/icons/react.svg", url: "https://react.dev/" },
  { name: "TypeScript", icon: "/icons/typescript.svg", url: "https://www.typescriptlang.org/" },
  { name: "Vite", icon: "/icons/vite.svg", url: "https://vitejs.dev/" },
  { name: "Tailwind CSS", icon: "/icons/tailwind.svg", url: "https://tailwindcss.com/" },
  { name: "Node.js", icon: "/icons/nodejs.svg", url: "https://nodejs.org/" },
  { name: "Express", icon: "/icons/express.svg", url: "https://expressjs.com/" },
  { name: "MySQL", icon: "/icons/mysql.svg", url: "https://www.mysql.com/" },
  { name: "Drizzle ORM", icon: "/icons/drizzle.svg", url: "https://orm.drizzle.team/" },
  { name: "Session Auth", icon: "/icons/session.svg", url: "https://www.npmjs.com/package/express-session" },
  { name: "Multer", icon: "/icons/multer.svg", url: "https://www.npmjs.com/package/multer" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-primary">About This Web App</h1>
        <p className="mb-6 text-slate-700">
          <strong>Library Management System</strong> is a modern web application designed to help organizations manage their digital and physical library collections efficiently. It provides features for repository management, user and admin roles, PDF viewing, category and location management, analytics, and more.
        </p>
        <h2 className="text-xl font-semibold mb-2 text-primary">Tech Stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {techStack.map((tech) => (
            <a
              key={tech.name}
              href={tech.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 bg-slate-50 rounded-lg p-3 border border-slate-100 hover:bg-blue-50 transition-colors"
              title={tech.name + ' website'}
            >
              <img src={tech.icon} alt={tech.name + ' icon'} width={40} height={40} className="shrink-0" />
              <span className="font-medium text-slate-800">{tech.name}</span>
            </a>
          ))}
        </div>
        <h2 className="text-xl font-semibold mb-2 text-primary">How to Access</h2>
        <ul className="list-disc pl-6 mb-6 text-slate-700">
          <li>For <strong>Admins</strong>: Login with your admin credentials to access all features, including repository, user, and report management.</li>
          <li>For <strong>Users</strong>: Login with your user credentials to view and search the repository, and access your permitted features.</li>
          <li>The app is accessible on your local network or server at the address provided by your administrator (<code>http://10.5.19.123:5000</code>).</li>
        </ul>
        <h2 className="text-xl font-semibold mb-2 text-primary">Contact & Support</h2>
        <p className="text-slate-700">
          For help, feedback, or technical support, please contact your system administrator or the development team.
        </p>
      </div>
    </div>
  );
}
