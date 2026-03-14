class Role < ApplicationRecord
  has_many :role_skills, dependent: :destroy
  has_many :skills, through: :role_skills

  validates :title, presence: true
  validates :status, inclusion: { in: %w[open filled closed] }

  # Find matching volunteers based on the role's skills
  def matching_volunteers
    Volunteer.joins(:skills).where(skills: { id: skill_ids }).distinct
  end
end
