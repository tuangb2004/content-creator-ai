import { Icons } from '../Icons';

const SmartCreation = () => {
    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto h-full flex flex-col justify-center">
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-black dark:text-white">Sáng tạo thông minh</h1>
            </div>

            <div className="flex flex-col lg:flex-row justify-between gap-16">
                {/* Left Side Content */}
                <div className="lg:w-5/12 space-y-10">
                    <h2 className="text-4xl font-bold leading-tight text-black dark:text-white">
                        Nhận video mỗi ngày. Không cần làm gì. Chỉ cần quay lại và xem.
                    </h2>
                    <p className="text-black/70 dark:text-gray-400 text-lg leading-relaxed">
                        Thêm sản phẩm để nhận video được tạo tự động mỗi ngày. Chỉ cần quay lại và xem các video được tạo riêng cho bạn.
                    </p>

                    <div className="space-y-8 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gray-200 dark:bg-gray-700 -z-10"></div>

                        <div className="flex gap-6">
                            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0f172a]">1</div>
                            <div>
                                <h3 className="font-bold text-lg text-black dark:text-white">Thêm thông tin và hình ảnh cho sản phẩm</h3>
                                <p className="text-black/70 dark:text-gray-400 mt-1">Càng nhiều thông tin sản phẩm sẽ dẫn đến kết quả tốt hơn.</p>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0f172a]">2</div>
                            <div>
                                <h3 className="font-bold text-lg text-black dark:text-white">Video được tạo tự động cho bạn</h3>
                                <p className="text-black/70 dark:text-gray-400 mt-1">Video sẽ được tạo trong giờ thấp điểm. Không tốn credit và công sức. Đôi bên cùng có lợi.</p>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0f172a]">3</div>
                            <div>
                                <h3 className="font-bold text-lg text-black dark:text-white">Kiểm tra video vào ngày hôm sau</h3>
                                <p className="text-black/70 dark:text-gray-400 mt-1">Tải xuống video bạn thích, hoặc chỉnh sửa để làm chúng nổi bật.</p>
                            </div>
                        </div>
                    </div>

                    <button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-bold py-3 px-8 rounded-lg transition-colors mt-6">
                        Authorize
                    </button>
                </div>

                {/* Right Side Visuals - Masonry Grid */}
                <div className="lg:w-6/12 w-full">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4 pt-8">
                            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] group">
                                <img src="https://images.unsplash.com/photo-1599658880436-c61792e70672?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Product" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30">Product showcase</span>
                                </div>
                            </div>
                            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] group">
                                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Product" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30">How-to-use</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] group">
                                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Product" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30">Brand story</span>
                                </div>
                            </div>
                            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] group">
                                <img src="https://images.unsplash.com/photo-1522335789203-abd31fe881eb?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Product" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full text-center">
                                    <div className="bg-white rounded-lg p-2 w-20 mx-auto mb-2 shadow-lg">
                                        <img src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=100&q=80" className="w-full h-auto" alt="Product Thumbnail" />
                                    </div>
                                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30">Customer reviews</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Help Bubble */}
            <div className="fixed bottom-8 right-8">
                <button className="w-10 h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                    <Icons.HelpCircle size={20} />
                </button>
            </div>
        </div>
    );
};

export default SmartCreation;
