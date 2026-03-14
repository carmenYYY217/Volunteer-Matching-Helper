module Api
  module V1
    module Public
      class SkillsController < ApplicationController
        def index
          render json: Skill.all
        end
      end
    end
  end
end
