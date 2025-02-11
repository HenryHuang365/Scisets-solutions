/*
  Warnings:

  - A unique constraint covering the columns `[area,title,link,year]` on the table `F3Data` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[area,country,data]` on the table `F4Data` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[area,news,twitter,facebook,reddit]` on the table `F7Data` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "F3Data_area_title_link_year_key" ON "F3Data"("area", "title", "link", "year");

-- CreateIndex
CREATE UNIQUE INDEX "F4Data_area_country_data_key" ON "F4Data"("area", "country", "data");

-- CreateIndex
CREATE UNIQUE INDEX "F7Data_area_news_twitter_facebook_reddit_key" ON "F7Data"("area", "news", "twitter", "facebook", "reddit");
