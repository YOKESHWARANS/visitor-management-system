CREATE DATABASE IF NOT EXISTS visitor_db;
USE visitor_db;

CREATE TABLE IF NOT EXISTS visitors (
  id VARCHAR(36) PRIMARY KEY,
  visitorName VARCHAR(100) NOT NULL,
  mobileNumber VARCHAR(15) NOT NULL,
  apartmentNumber VARCHAR(50) NOT NULL,
  vehicleType VARCHAR(50) DEFAULT 'None',
  vehicleNumber VARCHAR(50),
  purpose VARCHAR(200) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  timeOfVisit DATETIME NOT NULL,
  entryCode VARCHAR(20) NOT NULL,
  exitTime DATETIME NULL,
  status ENUM('active', 'exited') DEFAULT 'active'
);

-- Add index for faster lookups
CREATE INDEX idx_mobile_entry ON visitors (mobileNumber, entryCode);
CREATE INDEX idx_status ON visitors (status);