class Availability < ApplicationRecord
  belongs_to :volunteer

  validates :day_of_week, presence: true
  validates :time_of_day, presence: true
end
