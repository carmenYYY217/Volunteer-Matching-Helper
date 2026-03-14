module Api
  module V1
    module Public
      class AvailabilitiesController < ApplicationController
        def index
          # For the public form, we just need the standard days and times
          # We don't need to query the database since these are static options for the MVP
          render json: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            times: ['Morning', 'Afternoon', 'Evening']
          }
        end
      end
    end
  end
end
