import { AppConfig } from '../types';

export const GOLD_CONFIG: AppConfig = {
  currentShopId: 'kim-mon-daklak',
  refreshIntervalMs: 60000, // Refresh gold prices every 60s
  shops: [
    {
      id: 'kim-mon-daklak',
      name: 'Vàng Kim Môn - Buôn Ma Thuột (Đắk Lắk)',
      alias: 'kim-mon-daklak',
      address: 'Số 12-14-16 Nguyễn Công Trứ, TP. Buôn Ma Thuột, Tỉnh Đắk Lắk',
      phone: '0262.385.4418 / 0914.070.778',
      website: 'https://vangkimmonbmt.com',
      facebookUrl: 'https://facebook.com/vangkimmonbmt',
      notes: [
        'Giá vàng niêm yết áp dụng trực tiếp cho giao dịch ký quỹ, mua bán thực tế tại Tiệm Vàng Kim Môn Đắk Lắk.',
        'Đơn vị tính hiển thị: vnđ trên mỗi hộp/vỉ 2 chỉ đặc chủng thương hiệu Kim Môn.',
        'Giá vàng Trang sức chưa bao gồm tiền công chế tác và hao hụt kỹ thuật tùy mẫu mã.',
        'Thương hiệu vàng uy tín bậc nhất Tây Nguyên, bảo chứng chất lượng vàng ròng 99.99% chuẩn xác.'
      ],
      goldTypes: [
        {
          id: 'km_nhan_9999',
          name: 'Nhẫn Tròn Kim Môn 9999 (24K)',
          type: 'nhan_pure',
          purity: '99.99%',
          unit: '2 chỉ',
          baseBuyMultiplier: 2.0,
          baseSellMultiplier: 2.0,
          spreadVND: 300000,
          description: 'Nhẫn tròn trơn ép vỉ cao cấp thương hiệu Kim Môn Đắk Lắk, chống trầy xước hao mòn.'
        },
        {
          id: 'km_nhan_bmt_999',
          name: 'Nhẫn Tròn Kim Môn BMT 999',
          type: 'nhan_pure',
          purity: '99.9%',
          unit: '2 chỉ',
          baseBuyMultiplier: 1.9972,
          baseSellMultiplier: 1.9972,
          spreadVND: 300000,
          description: 'Nhẫn đúc ép vỉ thương hiệu vàng Kim Môn truyền thống lâu đời.'
        },
        {
          id: 'km_trang_suc_995',
          name: 'Trang sức KM 995',
          type: 'vang_18k',
          purity: '99.5%',
          unit: '2 chỉ',
          baseBuyMultiplier: 1.9817,
          baseSellMultiplier: 1.9817,
          spreadVND: 370000,
          description: 'Trang sức vàng ta kiểu dáng tinh tế, hàm lượng vàng cam kết chuẩn quốc tế.'
        },
        {
          id: 'km_trang_suc_999',
          name: 'Trang sức KM 999',
          type: 'nhan_pure',
          purity: '99.9%',
          unit: '2 chỉ',
          baseBuyMultiplier: 1.9901,
          baseSellMultiplier: 1.9902,
          spreadVND: 350000,
          description: 'Dành cho quà cưới tôn vinh hạnh phúc gia đình Việt, gia công tinh xảo tỉ mỉ.'
        },
        {
          id: 'km_trang_suc_9999',
          name: 'Trang sức KM 9999 (24K)',
          type: 'nhan_pure',
          purity: '99.99%',
          unit: '2 chỉ',
          baseBuyMultiplier: 1.9930,
          baseSellMultiplier: 1.9930,
          spreadVND: 350000,
          description: 'Kiệt tác trang sức đúc vàng ròng nguyên khối của phân gia thiết chế Kim Môn.'
        },
        {
          id: 'km_vang_tu_do',
          name: 'Vàng 9999 Tự Do (Tham Khảo)',
          type: 'nhan_pure',
          purity: '99.99%',
          unit: '2 chỉ',
          baseBuyMultiplier: 1.9859,
          baseSellMultiplier: 1.9859,
          spreadVND: 500000,
          description: 'Nhận diện thanh khoản và mức giá tham chiếu của vàng nhẫn tự do trong vùng.'
        }
      ]
    },
    {
      id: 'kim-mon',
      name: 'Vàng Kim Môn (Mão Thiết)',
      alias: 'kim-mon',
      address: 'Thị trấn Phú Thứ, Thị xã Kinh Môn, Tỉnh Hải Dương',
      phone: '0988.XXX.XXX / 0320.3.XXX.XXX',
      website: 'https://giavangmaothiet.com/gia-vang-kim-mon-hom-nay/',
      logoUrl: '',
      facebookUrl: 'https://facebook.com/vangmaothietkimmon',
      zaloUrl: 'https://zalo.me/0988xxxxxx',
      notes: [
        'Vàng Kim Môn (hiệu vàng Mão Thiết) chế tác tinh xảo, chất lượng cao.',
        'Giá vàng bán ra chưa bao gồm tiền công chế tác (với vàng trang sức).',
        'Quý khách vui lòng gọi hotline để ép giá sỉ hoặc đặt hàng gia công đặc biệt.',
        'Nhận mua bán, trao đổi vàng 99.99%, vàng tây 18K/14K/10K uy tín bậc nhất Hải Dương.'
      ],
      goldTypes: [
        {
          id: 'nhan_9999',
          name: 'Nhẫn Trơn Kim Môn 99.99%',
          type: 'nhan_pure',
          purity: '99.99%',
          unit: 'chỉ',
          baseBuyMultiplier: 1.0, // Anchored to base 24K ring price
          baseSellMultiplier: 1.0,
          spreadVND: 180000, // Safe spread (Mua vào vs Bán ra)
          description: 'Sản phẩm tích trữ truyền thống, đúc ép vỉ nylons chống trầy xước, hao hụt.'
        },
        {
          id: 'sjc_custom',
          name: 'Vàng Miếng SJC Kim Môn',
          type: 'sjc',
          purity: '99.99%',
          unit: 'lượng',
          baseBuyMultiplier: 1.0, // SJC National standard
          baseSellMultiplier: 1.0,
          spreadVND: 2000000, // SJC has a wider spread per lượng
          description: 'Vàng miếng thương hiệu Quốc gia SJC chính hãng, thanh khoản tuyệt đối.'
        },
        {
          id: 'vang_18k',
          name: 'Vàng Trang Sức Tây 18K (75%)',
          type: 'vang_18k',
          purity: '75.0%',
          unit: 'chỉ',
          baseBuyMultiplier: 0.74, // ~74% content price representation
          baseSellMultiplier: 0.76,
          spreadVND: 350000,
          description: 'Thích hợp chế tác nhẫn cưới, dây chuyền, lắc tay đính đá sang trọng quý phái.'
        },
        {
          id: 'vang_14k',
          name: 'Vàng Mỹ Nghệ Tây 14K (58.3%)',
          type: 'vang_14k',
          purity: '58.3%',
          unit: 'chỉ',
          baseBuyMultiplier: 0.57,
          baseSellMultiplier: 0.59,
          spreadVND: 400000,
          description: 'Kết hợp độ cứng tối ưu và ánh kim rực rỡ, độ bền vượt trội theo năm tháng.'
        },
        {
          id: 'vang_10k',
          name: 'Vàng Tây Phổ Thông 10K (41.7%)',
          type: 'vang_10k',
          purity: '41.7%',
          unit: 'chỉ',
          baseBuyMultiplier: 0.40,
          baseSellMultiplier: 0.42,
          spreadVND: 450000,
          description: 'Vàng cưới phân khúc dễ tiếp cận, thiết kế hiện đại nhập khẩu trực tiếp.'
        }
      ]
    },
    {
      id: 'sjc-hanoi',
      name: 'Vàng SJC Hà Nội (Chuẩn)',
      alias: 'sjc-hanoi',
      address: 'Trụ sở chính SJC, Quận Hoàn Kiếm, TP. Hà Nội',
      phone: '024.3934.XXX',
      website: 'https://sjc.com.vn',
      facebookUrl: 'https://facebook.com/sjcsaigon',
      notes: [
        'Bảng giá niêm yết chính thức của Công ty Vàng Bạc Đá Quý Sài Gòn chi nhánh Hà Nội.',
        'Giá vàng miếng SJC được Ngân hàng Nhà nước quản lý chặt chẽ.',
        'Khách mua số lượng lớn hoặc nộp lượng ký gửi vui lòng xuất trình CCCD chính chủ.'
      ],
      goldTypes: [
        {
          id: 'sjc_hn_luong',
          name: 'Vàng Miếng SJC (Lượng)',
          type: 'sjc',
          purity: '99.99%',
          unit: 'lượng',
          baseBuyMultiplier: 1.0,
          baseSellMultiplier: 1.0,
          spreadVND: 2000000,
          description: 'Thương hiệu vàng quốc gia chuẩn SJC, đơn vị tính 1 Lượng.'
        },
        {
          id: 'sjc_hn_nhan',
          name: 'Vàng Nhẫn SJC 99.99% (Chỉ)',
          type: 'nhan_pure',
          purity: '99.99%',
          unit: 'chỉ',
          baseBuyMultiplier: 0.995,
          baseSellMultiplier: 0.995,
          spreadVND: 150000,
          description: 'Nhẫn tròn trơn SJC từ 1 chỉ, 2 chỉ đến 5 chỉ.'
        }
      ]
    },
    {
      id: 'doji-haiduong',
      name: 'Tập Đoàn DOJI Hải Dương',
      alias: 'doji-haiduong',
      address: 'Đường Trần Hưng Đạo, TP. Hải Dương, Tỉnh Hải Dương',
      phone: '1800 1168',
      website: 'https://doji.vn',
      notes: [
        'Hệ thống trung tâm vàng bạc trang sức DOJI phân phối độc quyền.',
        'Sản phẩm nhẫn Hưng Thịnh Vượng đúc nổi tiếng thị trường đồ tích lũy.'
      ],
      goldTypes: [
        {
          id: 'doji_mieng',
          name: 'Vàng Miếng DOJI Hải Dương',
          type: 'sjc',
          purity: '99.99%',
          unit: 'lượng',
          baseBuyMultiplier: 0.998,
          baseSellMultiplier: 0.998,
          spreadVND: 1900000,
          description: 'Vàng miếng ép vỉ siêu bền độc quyền Tập đoàn DOJI.'
        },
        {
          id: 'doji_nhan',
          name: 'Nhẫn Tròn Trơn Hưng Thịnh Vượng',
          type: 'nhan_pure',
          purity: '99.99%',
          unit: 'chỉ',
          baseBuyMultiplier: 1.002,
          baseSellMultiplier: 1.002,
          spreadVND: 170000,
          description: 'Nhẫn đúc ép vỉ thương hiệu Kim gia tôn vinh tài lộc.'
        }
      ]
    }
  ]
};
