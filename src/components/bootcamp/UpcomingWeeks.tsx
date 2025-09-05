import React from 'react';

export const UpcomingWeeks: React.FC = () => {
  const upcomingWeeks = [
    {
      week: 2,
      title: "Addition & Subtraction",
      tags: ["Mental Strategies", "Column Method"]
    },
    {
      week: 3,
      title: "Multiplication & Division",
      tags: ["Tables", "Word Problems"]
    },
    {
      week: 4,
      title: "Fractions",
      tags: ["Simple Fractions", "Equivalent Fractions"]
    }
  ];

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-6 shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Weeks</h3>
      <div className="space-y-4">
        {upcomingWeeks.map((week) => (
          <div key={week.week} className="bg-background p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-semibold text-foreground">Week {week.week}</span>
              <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-full">Foundation</span>
            </div>
            <p className="text-base font-semibold text-foreground mb-3">{week.title}</p>
            <div className="flex flex-wrap gap-2">
              {week.tags.map((tag) => (
                <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};