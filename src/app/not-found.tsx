export default async function NotFound() {
    return (
        <div className="min-h-screen bg-doser-background">
            <div className="relative z-10">
                <div className="container mx-auto px-6 min-h-screen flex items-center relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                        <div className="space-y-8">
                            <h1 className="text-4xl lg:text-6xl font-bold text-doser-text leading-tight">404 - Page Not Found</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

