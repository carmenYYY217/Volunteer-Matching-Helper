class Skill < ApplicationRecord
  has_many :volunteer_skills, dependent: :destroy
  has_many :volunteers, through: :volunteer_skills
  has_many :role_skills, dependent: :destroy
  has_many :roles, through: :role_skills

  validates :name, presence: true, uniqueness: true

  before_validation :normalize_name

  private

  def normalize_name
    self.name = name.to_s.strip.downcase
  end
end
