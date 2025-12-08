package com.toji.toji.service;

import java.util.List;

public interface DroneScheduleService {
    /**
     * Syncs the list of dates to the database.
     * New dates are inserted, existing ones are ignored.
     * 
     * @param dates List of date strings (YYYYMMDD)
     */
    void syncScheduleDates(List<String> dates);

    /**
     * Retrieves all stored schedule dates.
     * 
     * @return List of date strings
     */
    List<String> getAllScheduleDates();
}
