from app.repositories import analytics_repository

def get_summary():
    stats = analytics_repository.get_summary_stats()
    recent = analytics_repository.get_recent_activity(limit=10)
    return {
        'stats': stats,
        'recent_activity': recent
    }
