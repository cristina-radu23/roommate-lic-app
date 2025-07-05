import React, { useState, useEffect } from 'react';
import { RoommateAnnouncement, AnnouncementFilters } from '../../types/roommate';
import { roommateAnnouncementApi } from '../../services/roommateApi';
import AnnouncementCard from './AnnouncementCard';
import './RoommateAnnouncements.css';

interface RoommateAnnouncementsBrowserProps {
  filters: AnnouncementFilters;
  onFiltersChange?: (filters: AnnouncementFilters) => void;
}

const RoommateAnnouncementsBrowser: React.FC<RoommateAnnouncementsBrowserProps> = ({ filters, onFiltersChange }) => {
  const [announcements, setAnnouncements] = useState<RoommateAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAnnouncements = async (page = 1, newFilters?: AnnouncementFilters) => {
    try {
      setLoading(true);
      setError(null);
      const { preferredCities, ...apiFilters } = newFilters || filters;
      const response = await roommateAnnouncementApi.getAnnouncements(
        page,
        10,
        apiFilters
      );
      setAnnouncements(response.data);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(response.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements(1, filters);
    // eslint-disable-next-line
  }, [filters]);

  const handlePageChange = (page: number) => {
    fetchAnnouncements(page, filters);
  };

  return (
    <div className="roommate-announcements">
      <div className="announcements-header">
        <h1>Find Your Perfect Roommate</h1>
        <p>Browse through roommate announcements and find your ideal match</p>
      </div>
      <div className="announcements-content">
        <div className="announcements-main">
          {loading && announcements.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading announcements...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={() => fetchAnnouncements()} className="retry-button">
                Try Again
              </button>
            </div>
          ) : announcements.length === 0 ? (
            <div className="no-announcements">
              <h3>No announcements found</h3>
              <p>Try adjusting your search criteria or check back later for new announcements.</p>
            </div>
          ) : (
            <>
              <div className="announcements-grid">
                {announcements.map((announcement) => (
                  <AnnouncementCard 
                    key={announcement.announcementId}
                    announcement={announcement}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoommateAnnouncementsBrowser; 