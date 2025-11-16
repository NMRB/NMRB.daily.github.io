import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import NavigationHeader from "../components/organisms/NavigationHeader/NavigationHeader";
import WeeklyBreakdown from "../components/WeeklyBreakdown";

const WeeklyAnalyticsPage = () => {
  const navigate = useNavigate();
  const { date } = useParams();
  const [searchParams] = useSearchParams();

  // Get week start date from URL params or search params
  const getInitialWeekStart = () => {
    // Try to get from URL path parameter first
    if (date) {
      try {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      } catch (error) {
        console.warn("Invalid date in URL:", date);
      }
    }

    // Try to get from search parameters
    const weekParam = searchParams.get("week");
    if (weekParam) {
      try {
        const parsedDate = new Date(weekParam);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      } catch (error) {
        console.warn("Invalid week in search params:", weekParam);
      }
    }

    // Default to current week
    return null;
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <>
      <NavigationHeader />
      <WeeklyBreakdown
        onBack={handleBack}
        initialWeekStart={getInitialWeekStart()}
      />
    </>
  );
};

export default WeeklyAnalyticsPage;
