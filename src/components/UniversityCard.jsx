import { Link } from "react-router-dom";
import { MapPin, Trophy, ExternalLink, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";

const UniversityCard = ({ university }) => {
  return (
    <div 
      className="group bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      data-testid={`university-card-${university.university_id}`}
    >
      {/* Cover Image */}
      <div className="relative h-40 bg-gradient-to-br from-teal-200 to-terracotta-100">
        {university.cover_image ? (
          <img 
            src={university.cover_image} 
            alt={university.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🏛️</span>
          </div>
        )}
        
        {/* Ranking Badge */}
        {university.ranking && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-500 text-white px-3 py-1.5 rounded-full shadow-lg">
            <Trophy className="w-4 h-4" />
            <span className="font-semibold text-sm">#{university.ranking}</span>
          </div>
        )}

        {/* Country Flag/Badge */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
          <span className="flex items-center gap-1 text-sm font-medium">
            <MapPin className="w-4 h-4 text-terracotta-600" />
            {university.city}, {university.country}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Logo & Name */}
        <div className="flex items-start gap-3 mb-3">
          {university.logo && (
            <img src={university.logo} alt="" className="w-12 h-12 object-contain" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-lg text-foreground truncate">
              {university.name}
            </h3>
            <a 
              href={university.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              Visit Website
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Programs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {university.programs?.map((program) => (
            <Badge key={program} variant="outline" className="text-xs">
              {program}
            </Badge>
          ))}
        </div>

        {/* Popular Majors */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          <span className="font-medium">Popular:</span> {university.popular_majors?.slice(0, 3).join(', ')}
        </p>

        {/* Tuition & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-xs text-muted-foreground">Tuition Range</span>
            <p className="font-heading font-bold text-teal-700">
              ${university.tuition_min?.toLocaleString()} - ${university.tuition_max?.toLocaleString()}
            </p>
          </div>
          <Link to={`/universities/${university.university_id}`}>
            <button className="flex items-center gap-1 text-teal-700 font-semibold hover:text-teal-800 transition-colors" data-testid={`view-university-${university.university_id}`}>
              Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UniversityCard;
