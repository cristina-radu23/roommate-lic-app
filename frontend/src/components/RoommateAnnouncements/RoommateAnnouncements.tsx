import React, { useState, useEffect } from 'react';
import { RoommateAnnouncement, AnnouncementFilters } from '../../types/roommate';
import { roommateAnnouncementApi } from '../../services/roommateApi';
import AnnouncementCard from './AnnouncementCard';
import SearchFilters from './SearchFilters';
import './RoommateAnnouncements.css';
import RoommateAnnouncementsBrowser from './RoommateAnnouncementsBrowser';

const RoommateAnnouncements: React.FC = () => <RoommateAnnouncementsBrowser />;

export default RoommateAnnouncements; 